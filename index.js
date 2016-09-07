import d3 from 'd3';
import lru from 'lru-cache';
import express from 'express';
import * as nunjucks from './server/nunjucks';
import nationalController from './server/controllers/national';
import stateController from './server/controllers/state';
import stateCodeRedirectController from './server/controllers/state-code-redirect';
import ecForecastComponentController from './server/controllers/ec-forecast-component';
import pollGraphicsController from './server/controllers/poll-graphics';
import getBerthaData from './server/lib/getBerthaData.js';

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error.stack);
  process.exit(1);
});

const getPollAverages = require('./layouts/getPollAverages.js');
const template = nunjucks.env;
const layoutTimeSeries = require('./layouts/timeseries-layout.js');
const layoutForecastMap = require('./layouts/forecast-map-layout');

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

app.get('/polls/:state.json', async (req, res) => {
  let value = await pollAverages('July 1, 2015', 'November 9, 2016', req.params.state);
  if (value) {
    setJSONHeaders(res).send(value);
  } else {
    value = false;
  }
  return value;
});

app.get('/polls.svg', pollGraphicsController);

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

app.get('/', (req, res) => {
  res.redirect('polls');
});

// convenience redirect in case users inputs it incorrectly
app.get('/polls-:state', (req, res) => {
  res.redirect(301, `${req.params.state}-polls`);
});

app.get('/polls', nationalController);
app.get('/:state-polls', stateController);

// support the old state poll format (redirect to new routes)
app.get('/polls/:code', stateCodeRedirectController);

// Create homepage(etc.) widget of current forecasts
app.get('/ec-forecast-component.html', ecForecastComponentController);
app.get('/ec-forecast-component.json', async (res,req) => { ecForecastComponentController(res, req, 'json') });

// This needs to be last as it captures lot of paths and only does redirects
app.get('/:code', stateCodeRedirectController);

async function makePollTimeSeries(chartOpts) {
  const startDate = chartOpts.startDate ? chartOpts.startDate : '2016-06-01 00:00:00';
  const endDate = chartOpts.endDate ? chartOpts.endDate : d3.isoFormat(new Date());
  const state = chartOpts.state ? chartOpts.state : 'us';
  const pollData = await pollAverages(startDate, endDate, state);
  return template.render('templated-polls.svg', layoutTimeSeries(pollData, chartOpts));
}

async function makeForecastMap(chartOpts) {
  const statePollingData = await getStateCounts(await getBerthaData());
  const layout = layoutForecastMap(statePollingData, chartOpts);
  if(chartOpts.dots === 'true') return template.render('dot-map.svg', layout);
  return template.render('map.svg', layout);
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

const server = app.listen(process.env.PORT || 5000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`running ${host} ${port}`);
});
