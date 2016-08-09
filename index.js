import Promise from 'bluebird';

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error.stack);
  process.exit(1);
});

const express = require('express');
const drawChart = require('./layouts/drawChart.js');
const getPollAverages = require('./layouts/getPollAverages.js');
const getAllPolls = require('./layouts/getAllPolls.js');
const getLatestPollAverage = require('./layouts/getLatestPollAverage.js');
const lastUpdated = require('./layouts/getLastUpdated.js');
const nunjucks = require('nunjucks');
const markdown = require('nunjucks-markdown');
const marked = require('marked');
const d3 = require('d3');
const lru = require('lru-cache');
const fetch = require('isomorphic-fetch');
const _ = require('underscore');
const stateIds = require('./layouts/stateIds').states;
const filters = require('./filters');
const berthaDefaults = require('./config/bertha-defaults.json')
const validStates = berthaDefaults.streampages.map( (d)=>d.state.toLowerCase() );

import flags from './config/flags';


const app = express();
const maxAge = 120; // for user agent caching purposes
const sMaxAge = 10;

app.disable('x-powered-by');

app.use(express.static('public'));

// utility functions
function setSVGHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}`);
  return res;
}

function setJSONHeaders(res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=' + maxAge);
    return res;
}

// takes query parameters and orders properly for cache key format
function convertToCacheKeyName(queryRequest) {
  const paramOrder = ['background', 'startDate', 'endDate', 'size', 'type', 'state', 'logo'];

  const cacheKey = paramOrder.reduce(function(a, b) {
    return a + queryRequest[b];
  }, queryRequest['fontless']);

  return cacheKey;
}

const env = nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

Object.assign(env.filters, filters);

markdown.register(env, marked);

const cache = lru({
  max: 500,
  maxAge: 60 * 1000, // 60 seconds
});

// routes
app.get('/__gtg', (req, res) => {
  res.send('ok');
});

app.get('/favicon.ico', (req, res)=>{ //explicit override to redirect if favicon is requested
  res.redirect(301, 'https://ig.ft.com/favicon.ico');
});

app.get('/polls.svg', async (req, res) => {

  const value = await makePollTimeSeries(req.query);
  if(value){
    setSVGHeaders(res).send(value);
  }else{
    res.status(500).send('something broke');
  }
});

async function makePollTimeSeries(chartOpts){
  const nowDate = new Date().toString().split(' ')
    .slice(1, 4)
    .join(' ');

  const formattedNowDate = d3.timeFormat('%B %e, %Y')((d3.timeParse('%b %d %Y')(nowDate)));

  const [svgWidth, svgHeight] = (chartOpts.size || '600x300').split('x');

  const options = {
    fontless: (typeof chartOpts.fontless === 'boolean' ? chartOpts.fontless : (chartOpts.fontless ? chartOpts.fontless === 'true' : true)),
    notext: typeof chartOpts.notext === 'boolean' ? chartOpts.notext : false,
    background: chartOpts.background || 'none',
    startDate: chartOpts.startDate || 'June 1, 2016',
    endDate: chartOpts.endDate || formattedNowDate,
    size: `${svgWidth}x${svgHeight}`,
    width: svgWidth,
    height: svgHeight,
    type: chartOpts.type || 'area',
    state: chartOpts.state || 'us',
    logo: (chartOpts.logo ? chartOpts.logo === 'true' : false),
  };
  const cacheKey = convertToCacheKeyName(options);

  let value = cache.get(cacheKey);

  if (!value) {
    // weird hack: add one day to endDate to capture the end date in the sequelize query
    const tempEndDatePieces = options.endDate.replace(/\s{2}/, ' ').split(' ');
    const queryEndDate = tempEndDatePieces[0] + ' ' + (+tempEndDatePieces[1].replace(/,/g, '') + 1) + ', ' + tempEndDatePieces[2];

    //cache the db request
    const dbCacheKey = 'dbAverages-' + [options.state, options.startDate, queryEndDate].join('-');
    let dbResponse = cache.get(dbCacheKey);
    if(!dbResponse){
      dbResponse = await getPollAverages(options.state, options.startDate, queryEndDate);
      cache.set(dbCacheKey, dbResponse);
    }

    try {
      const chartLayout = await drawChart(options, dbResponse);
      value = nunjucks.render('poll.svg', chartLayout);
      cache.set(cacheKey, value);
    } catch (error) {
      console.error(error);
      value = false;
    }
  }
  return value;
}



app.get('/polls/:state.json', async (req, res) => {
  const state = req.params.state;

  let value = cache.get(`pollaverages-json-${state}`); // check to see if we've cached poll averages json for state recently

  if (value) {
    setJSONHeaders(res).send(value);
  } else {
    try {
      value = await getPollAverages(state, 'July 1, 2015', 'November 9, 2016');
      setJSONHeaders(res).send(value);
      cache.set(`pollaverages-json-${state}`, value);
    } catch (error) {
      console.error(error);
      value = false;
    }
  }
  return value;
});



app.get('/', statePage);
app.get('/:state', (req,res) => {
  if(validStates.indexOf(req.params.state)>=0){
    statePage(req, res)
  }else{
    res.sendStatus(404);
  }
});

app.get('/polls/:state', (req,res) => {
  if(validStates.indexOf(req.params.state)>=0){
    statePage(req, res)
  }else{
    res.sendStatus(404);
  }
});

async function statePage(req, res) {

  let state = 'us';
  if(req.params.state) state = req.params.state;
  const canonicalURL = `polls/${state}`;

  res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}`);

  let cachePage = true;
  const pageCacheKey = `statePage-${state}`;

  let renderedPage = cache.get(pageCacheKey); // check to see if we've cached this page recently

  if (!renderedPage) {

    const stateName = _.findWhere(stateIds, { 'state': state.toUpperCase() }).stateName;
    // get intro text
    const contentURL = 'http://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/options,links,streampages';
    let data = berthaDefaults;

    try {
      const contentRes = await Promise.resolve(fetch(contentURL))
          .timeout(3000, new Error(`Timeout - bertha took too long to respond: ${contentURL}`));
      data = await contentRes.json();
    }catch(err){
      cachePage = false;
      console.log('bertha fetching problem, resorting to default bertha config');
    }

    const stateStreamURL = _.findWhere(data.streampages, { 'state': state.toUpperCase() }).link;

    const introtext1 = _.findWhere(data.options, { name: 'text' }).value;
    const introtext2 = _.findWhere(data.options, { name: 'secondaryText' }).value;
    let introText = `<p>${introtext1}</p>`;
    if (introtext2) {
      introText = `${introText}<p>${introtext2}</p>`;
    }

    // last update time
    let lastUpdatedTime = new Date(await lastUpdated());
    const streamTextLastUpdated =  new Date(_.findWhere(data.options, { name: 'updated' }).value);
    if (streamTextLastUpdated > lastUpdatedTime) {
      lastUpdatedTime = streamTextLastUpdated;
    }

    // get poll SVG
    async function getPollSVG(size = '600x300') {
      return makePollTimeSeries({
        fontless: true,
        notext: true,
        startDate: 'June 1, 2016',
        size: size,
        type: 'area',
        state: state,
        logo: false,
      });
    }

    // get individual polls
    let allIndividualPolls = await getAllPolls(state);
    allIndividualPolls = _.groupBy(allIndividualPolls, 'rcpid');
    allIndividualPolls = _.values(allIndividualPolls);
    let formattedIndividualPolls = [];
    _.each(allIndividualPolls, function(poll) {
      let winner = '';
      const clintonVal = _.findWhere(poll, {'candidatename': 'Clinton'}).pollvalue;
      const trumpVal = _.findWhere(poll, {'candidatename': 'Trump'}).pollvalue;

      if (clintonVal > trumpVal) {
        winner = 'Clinton';
      }

      if (trumpVal > clintonVal) {
        winner = 'Trump';
      }

      // unshift instead of push because dates keep being in chron instead of reverse chron
      // even when I change the pg query to order by endDate DESC
      formattedIndividualPolls.unshift({
        Clinton: _.findWhere(poll, {'candidatename': 'Clinton'}).pollvalue,
        Trump: _.findWhere(poll, {'candidatename': 'Trump'}).pollvalue,
        date: poll[0].date,
        pollster: poll[0].pollster.replace(/\*$/, '').replace(/\//g, ', '), // get rid of asterisk b/c RCP doesn't track what it means
        sampleSize: poll[0].sampleSize,
        winner: winner,
      });
    });

    // get latest poll averages for social
    const latestPollAverages = await getLatestPollAverage(state);

    let shareTitle;
    if (latestPollAverages) {
      if (state === 'us') {
        shareTitle = `US presidential election polls: It's Clinton ${latestPollAverages.Clinton}%, Trump ${latestPollAverages.Trump}%`;
      } else {
        shareTitle = `US presidential election polls: In ${stateName}, it's Clinton ${latestPollAverages.Clinton}%, Trump ${latestPollAverages.Trump}%`;
      }
    } else {
      shareTitle = `US presidential election polls: Here’s where ${stateName} stands now`;
    }

    const polltrackerLayout = {
      // quick hack for page ID while we only have a UUID for the National page
      id: state === 'us' ? 'e01abff0-5292-11e6-9664-e0bdc13c3bef' : null,
      state: state,
      stateName: stateName,
      lastUpdated: lastUpdatedTime,
      introText: introText,
      pollSVG: {
        default: await getPollSVG('355x200'),
        S: await getPollSVG('630x270'),
        M: await getPollSVG('603x270'),
        L: await getPollSVG('650x288'),
        XL: await getPollSVG('680x310'),
      },
      pollList: formattedIndividualPolls,
      canonicalURL: canonicalURL,
      stateStreamURL: stateStreamURL,
      flags: flags(),
      share: {
        title: shareTitle,
        summary: `US election poll tracker: Here's who's ahead`,
        url: `https://ig.ft.com/us-elections${req.url}`,
      },
    };

    renderedPage = nunjucks.render('polls.html', polltrackerLayout);
    if (cachePage) cache.set(pageCacheKey, renderedPage);
  }

  res.send(renderedPage);
}

const server = app.listen(process.env.PORT || 5000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`running ${host} ${port}`);
});
