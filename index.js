require('loud-rejection/register');
import Promise from 'bluebird';

const express = require('express');
const drawChart = require('./layouts/drawChart.js');
const getPollAverages = require('./layouts/getPollAverages.js');
const getAllPolls = require('./layouts/getAllPolls.js');
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

const app = express();
const maxAge = 120; // for user agent caching purposes
const sMaxAge = 10;

// utility functions
function setSVGHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}`);
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
  const fontless = (chartOpts.fontless ? chartOpts.fontless === 'true' : true);
  const background = chartOpts.background || 'none';
  const startDate = chartOpts.startDate || 'July 1, 2015';
  const endDate = chartOpts.endDate || formattedNowDate;
  const [width, height] = (chartOpts.size || '600x300').split('x');
  const type = chartOpts.type || 'line';
  const state = chartOpts.state || 'us';
  const logo = (chartOpts.logo ? chartOpts.logo === 'true' : false);

  const options = { fontless: fontless, background: background, startDate: startDate, endDate: endDate, size: `${width}x${height}`, type: type, state: state, logo: logo };

  let value = cache.get(convertToCacheKeyName(options));

  if (!value) {
    // weird hack: add one day to endDate to capture the end date in the sequelize query
    const tempEndDatePieces = endDate.replace(/\s{2}/, ' ').split(' ');
    const queryEndDate = tempEndDatePieces[0] + ' ' + (+tempEndDatePieces[1].replace(/,/g, '') + 1) + ', ' + tempEndDatePieces[2];
    const data = await getPollAverages(state, startDate, queryEndDate);
    try {
      const chartLayout = await drawChart(width, height, fontless, background, logo, startDate, endDate, type, state, data);
      value = nunjucks.render('poll.svg', chartLayout);
      cache.set(convertToCacheKeyName(chartOpts), value);
    } catch (error) {
      console.error(error);
      value = false;
    }
  }

  return value;
}

app.get('/', statePage);
app.get('/:state', statePage);
app.get('/polls/:state', statePage);

async function statePage(req, res) {
  console.log('state page', JSON.stringify(req.params))
  let state = 'us';

  if(req.params.state) state = req.params.state;

  const stateName = _.findWhere(stateIds, { 'state': state.toUpperCase() }).stateName;

  // get intro text
  const contentURL = 'http://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/options,links';
  const contentRes = await Promise.resolve(fetch(contentURL))
      .timeout(10000, new Error(`Timeout - bertha took too long to respond: ${contentURL}`));

  const data = await contentRes.json();


  const introText = '<p>' + _.findWhere(data.options, { name: 'text' }).value + '</p><p>' + _.findWhere(data.options, { name: 'secondaryText' }).value + '</p>';

  // get poll SVG
  const pollSVG = await makePollTimeSeries({ 
    fontless: true,
    startDate: 'June 7, 2016', 
    size: '600x300', 
    type: 'area', 
    state: state, 
    logo: false 
  });

  // get individual polls
  let formattedIndividualPolls = cache.get(`allPolls-${state}`); // check to see if we've cached polls recently
  if (!formattedIndividualPolls) {
    let allIndividualPolls = await getAllPolls(state);
    allIndividualPolls = _.groupBy(allIndividualPolls, 'rcpid');
    allIndividualPolls = _.values(allIndividualPolls);
    formattedIndividualPolls = [];
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
        pollster: poll[0].pollster,
        sampleSize: poll[0].sampleSize,
        winner: winner,
      });
    });
    cache.set(`allPolls-${state}`, formattedIndividualPolls);
  }

  const polltrackerLayout = {
    state: state,
    stateName: stateName,
    lastUpdated: await lastUpdated(),
    introText: introText,
    pollSVG: pollSVG,
    pollList: formattedIndividualPolls,
  };

  const value = nunjucks.render('polls.html', polltrackerLayout);
  
  res.send(value);
}

const server = app.listen(process.env.PORT || 5000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`running ${host} ${port}`);
});
