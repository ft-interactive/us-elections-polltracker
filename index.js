import Promise from 'bluebird';

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error.stack);
  process.exit(1);
});

const color = require('./layouts/color.js');
const express = require('express');
const getPollAverages = require('./layouts/getPollAverages.js');
const getAllPolls = require('./layouts/getAllPolls.js');
const getLatestPollAverage = require('./layouts/getLatestPollAverage.js');
const getAllLatestStateAverages = require('./layouts/getAllLatestStateAverages.js');
const lastUpdated = require('./layouts/getLastUpdated.js');
const nunjucks = require('nunjucks');
const markdown = require('nunjucks-markdown');
const marked = require('marked');
const d3 = require('d3');
const lru = require('lru-cache');
const fetch = require('isomorphic-fetch');
const _ = require('underscore');
const stateIds = require('./layouts/stateIds').states;
const layoutTimeSeries = require('./layouts/timeseries-layout.js');
const layoutForecastMap = require('./layouts/forecast-map-layout');
const filters = require('./filters');
const berthaDefaults = require('./config/bertha-defaults.json');
const validStates = berthaDefaults.streampages.map((d) => d.state.toLowerCase());

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

function setJSONHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=' + maxAge);
  return res;
}

// takes query parameters and orders properly for cache key format
function convertToCacheKeyName(queryRequest) {
  const paramOrder = ['background', 'startDate', 'endDate', 'size', 'type', 'state', 'logo','dots','key'];

  const cacheKey = paramOrder.reduce(function (a, b) {
    return a + queryRequest[b];
  }, queryRequest.fontless);

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

app.get('/favicon.ico', (req, res) => { // explicit override to redirect if favicon is requested
  res.redirect(301, 'https://ig.ft.com/favicon.ico');
});

app.get('/polls.svg', async (req, res) => {
  const cacheKey = 'polls-svg-' + convertToCacheKeyName(req.query);
  let value = cache.get(cacheKey);
  if (!value) {
    try {
      value = await makePollTimeSeries(req.query);
      if (value) cache.set(cacheKey, value);
    } catch (err) { console.log('ERROR making pollchart ', req.url); }
  }
  if (value) {
    setSVGHeaders(res).send(value);
  } else {
    res.status(500).send('something broke');
  }
});

//Create map of current forecasts
app.get('/forecast-map.svg', async (req, res) => {
  const cacheKey = 'forecast-map-svg-' + convertToCacheKeyName(req.query);
  let value = cache.get(cacheKey);
  if (!value) {
    value = await makeForecastMap(req.query);
    if (value) cache.set(cacheKey, value);
  }
  if (value) {
    setSVGHeaders(res).send(value);
  } else {
    res.status(500).send('something broke');
  }
});

app.get('/', statePage);
app.get('/:state', (req, res) => {
  if (validStates.indexOf(req.params.state) >= 0) {
    statePage(req, res);
  } else {
    res.sendStatus(404);
  }
});

app.get('/polls/:state', (req, res) => {
  if (validStates.indexOf(req.params.state) >= 0) {
    statePage(req, res);
  } else {
    res.sendStatus(404);
  }
});


async function makePollTimeSeries(chartOpts) {
  const startDate = chartOpts.startDate ? chartOpts.startDate : 'June 1, 2016';
  const endDate = chartOpts.endDate ? chartOpts.endDate : d3.timeFormat('%B %e, %Y')(new Date());
  const state = chartOpts.state ? chartOpts.state : 'us';
  const pollData = await pollAverages(startDate, endDate, state);
  return nunjucks.render('templated-polls.svg', layoutTimeSeries(pollData, chartOpts));
}

async function makeForecastMap(chartOpts) {
  const statePollingData = await getStateCounts(await getBerthaData());
  const layout = layoutForecastMap(statePollingData, chartOpts);
  console.log(layout.key)
  if(chartOpts.dots === 'true') return nunjucks.render('dot-map.svg', layout);
  return nunjucks.render('map.svg', layout);
}

async function pollAverages(start, end, state) {
  if (!state) state = 'us';
  const dbCacheKey = 'dbAverages-' + [state, start, end].join('-');
  let dbResponse = cache.get(dbCacheKey);
  if (!dbResponse) {
    dbResponse = await getPollAverages(state, start, end);
    cache.set(dbCacheKey, dbResponse);
  }
  return dbResponse;
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

async function statePage(req, res) {
  let state = 'us';
  if (req.params.state) state = req.params.state;
  const canonicalURL = `polls/${state}`;

  res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}`);

  let cachePage = true;
  const pageCacheKey = `statePage-${state}`;

  let renderedPage = cache.get(pageCacheKey); // check to see if we've cached this page recently

  if (!renderedPage) {
    const stateName = _.findWhere(stateIds, { 'state': state.toUpperCase() }).stateName;
    // get intro text
    const data = await getBerthaData();
    
    const stateStreamURL = _.findWhere(data.streampages, { 'state': state.toUpperCase() }).link;

    const introtext1 = _.findWhere(data.options, { name: 'text' }).value;
    const introtext2 = _.findWhere(data.options, { name: 'secondaryText' }).value;
    let introText = `<p>${introtext1}</p>`;
    if (introtext2) {
      introText = `${introText}<p>${introtext2}</p>`;
    }

    // last update time
    let lastUpdatedTime = new Date(await lastUpdated());
    const streamTextLastUpdated = new Date(_.findWhere(data.options, { name: 'updated' }).value);
    if (streamTextLastUpdated > lastUpdatedTime) {
      lastUpdatedTime = streamTextLastUpdated;
    }

    // get poll SVG
    async function getPollSVG(size = '600x300') {
      return makePollTimeSeries({
        fontless: true,
        notext: true,
        startDate: 'June 1, 2016',
        size,
        type: 'area',
        state,
        logo: false,
        margin: { top: 10, left: 35, bottom: 50, right: 90 },
      });
    }

    // get individual polls
    let allIndividualPolls = await getAllPolls(state);
    allIndividualPolls = _.groupBy(allIndividualPolls, 'rcpid');
    allIndividualPolls = _.values(allIndividualPolls);
    const formattedIndividualPolls = [];
    _.each(allIndividualPolls, function (poll) {
      let winner = '';
      const clintonVal = _.findWhere(poll, { candidatename: 'Clinton' }).pollvalue;
      const trumpVal = _.findWhere(poll, { candidatename: 'Trump' }).pollvalue;

      if (clintonVal > trumpVal) {
        winner = 'Clinton';
      }

      if (trumpVal > clintonVal) {
        winner = 'Trump';
      }

      // unshift instead of push because dates keep being in chron instead of reverse chron
      // even when I change the pg query to order by endDate DESC
      formattedIndividualPolls.unshift({
        Clinton: _.findWhere(poll, { candidatename: 'Clinton' }).pollvalue,
        Trump: _.findWhere(poll, { candidatename: 'Trump' }).pollvalue,
        date: poll[0].date,
        pollster: poll[0].pollster.replace(/\*$/, '').replace(/\//g, ', '), // get rid of asterisk b/c RCP doesn't track what it means
        sampleSize: poll[0].sampleSize,
        winner,
      });
    });

    // get latest poll averages for social
    const latestPollAverages = await getLatestPollAverage(state);

    let shareTitle = `US presidential election polls: Here’s where ${stateName} stands now`;
    if (latestPollAverages) {
      if (state === 'us') {
        shareTitle = `US presidential election polls: It's Clinton ${latestPollAverages.Clinton}%, Trump ${latestPollAverages.Trump}%`;
      } else {
        shareTitle = `US presidential election polls: In ${stateName}, it's Clinton ${latestPollAverages.Clinton}%, Trump ${latestPollAverages.Trump}%`;
      }
    }

    // get latest state data for map and national bar
    const stateCounts = await getStateCounts(data);

    const polltrackerLayout = {
      // quick hack for page ID while we only have a UUID for the National page
      id: state === 'us' ? 'e01abff0-5292-11e6-9664-e0bdc13c3bef' : null,
      state,
      stateName,
      lastUpdated: lastUpdatedTime,
      introText,
      pollSVG: {
        default: await getPollSVG('355x200'),
        S: await getPollSVG('630x270'),
        M: await getPollSVG('603x270'),
        L: await getPollSVG('650x288'),
        XL: await getPollSVG('680x310'),
      },
      pollList: formattedIndividualPolls,
      canonicalURL,
      stateStreamURL,
      flags: flags(),
      share: {
        title: shareTitle,
        summary: 'US election poll tracker: Here\'s who\'s ahead',
        url: `https://ig.ft.com/us-elections${req.url}`,
      },
      stateCounts,
      nationalBarCounts: nationalCount(stateCounts),
      color,
    };

    renderedPage = nunjucks.render('polls.html', polltrackerLayout);
    if (cachePage) cache.set(pageCacheKey, renderedPage);
  }

  res.send(renderedPage);
}


async function getBerthaData(){
    const contentURL = 'http://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/options,links,streampages,overrideCategories';
    let data = berthaDefaults;

    try {
      const contentRes = await Promise.resolve(fetch(contentURL))
          .timeout(3000, new Error(`Timeout - bertha took too long to respond: ${contentURL}`));
      return await contentRes.json();
    } catch (err) {
      cachePage = false;
      console.log('bertha fetching problem, resorting to default bertha config');
    }
}

async function getStateCounts(overrideData) {
  const latestStateAverages = await getAllLatestStateAverages();
  const groupedStateCounts = _.groupBy(latestStateAverages, 'state');
  const overrideCategories = overrideData.overrideCategories;
  const stateCounts = {};

  for (let i = 0; i < stateIds.length; i++) {
    const stateKey = stateIds[i].state;
    let clintonAvg = null;
    let trumpAvg = null;
    let margin = null;

    if (stateKey !== 'US') {
      if (stateKey.toLowerCase() in groupedStateCounts) {
        const statePollAverages = groupedStateCounts[stateKey.toLowerCase()];
        clintonAvg = _.findWhere(statePollAverages, { candidatename: 'Clinton' }).pollaverage || null;
        trumpAvg = _.findWhere(statePollAverages, { candidatename: 'Trump' }).pollaverage || null;
        if (clintonAvg && trumpAvg) {
          margin = clintonAvg - trumpAvg;
        }
      }

      stateCounts[stateKey] = {
        Clinton: clintonAvg,
        Trump: trumpAvg,
        margin: margin || _.findWhere(overrideCategories, { state: stateKey.toUpperCase() }).overridevalue,
        ecVotes: _.findWhere(stateIds, { state: stateKey.toUpperCase() }).ecVotes,
      };
    }
  }

  return stateCounts;
}

function nationalCount(stateData) {
  const classification = d3.scaleThreshold()
      .range(['rep', 'leaningRep', 'swing', 'leaningDem', 'dem'])
      .domain([-10, -5, 5, 10]);

  // for ME and NE classification
  // if one CD (congressional district) is rep and another is leaningRep (or dem and leaningDem), do another round of classification to categorize 2 remaining votes as leaningRep or leaningDem
  const meneClassification = d3.scaleThreshold()
    .range(['leaningRep', 'swing', 'leaningDem'])
    .domain([-5, 5]);

  const stateCounts = Object.keys(stateData).reduce((cumulative, stateCode) => {
    const state = stateData[stateCode];

    // deal with Nebraska and Maine. TODO get rid of redundancies here
    if (stateCode === 'ME') {
      if (classification(stateData.ME.margin) === classification(stateData.MECD.margin)) {
        cumulative[classification(stateData.ME.margin)] += 2;
        // console.log(stateCode, 'added 2 to ', classification(state.margin));
      } else {
        if (meneClassification(stateData.ME.margin) === meneClassification(stateData.MECD.margin)) {
          cumulative[meneClassification(stateData.ME.margin)] += 2;
          // console.log(stateCode, 'added 2 to ', meneClassification(stateData.ME.margin));
        } else {
          cumulative.swing += 2;
          // console.log(stateCode, 'added 2 to swing else');
        }
      }
    }

    if (stateCode === 'NE') {
      if (classification(stateData.NE.margin) === classification(stateData.NECD.margin) && classification(stateData.NECD.margin) === classification(stateData.NECD2.margin)) {
        cumulative[classification(stateData.NE.margin)] += 2;
        // console.log(stateCode, 'added 2 to ', classification(stateData.NE.margin));
      } else {
        if (meneClassification(stateData.NE.margin) === meneClassification(stateData.NECD.margin) && meneClassification(stateData.NECD.margin) === meneClassification(stateData.NECD2.margin)) {
          cumulative[meneClassification(stateData.NE.margin)] += 2;
          // console.log(stateCode, 'added 2 to ', meneClassification(stateData.NE.margin));
        } else {
          cumulative.swing += 2;
          // console.log(stateCode, 'added 2 to swing else');
        }
      }
    }

    cumulative[classification(state.margin)] += state.ecVotes;
    return cumulative;
  }, {
    dem: 0,
    leaningDem: 0,
    swing: 0,
    leaningRep: 0,
    rep: 0 });

  return stateCounts;
}

const server = app.listen(process.env.PORT || 5000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`running ${host} ${port}`);
});
