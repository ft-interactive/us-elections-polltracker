import express from 'express';
import lru from 'lru-cache';
import babelify from 'express-babelify-middleware';
import slashes from 'connect-slashes';
import * as nunjucks from './nunjucks';
import ecForecastComponentController from './controllers/ec-forecast-component';
import ecForecastComponentController2 from './controllers/ec-forecast-component-2';
import getPollAverages from '../layouts/getPollAverages.js';
import layoutForecastMap from '../layouts/forecast-map-layout';
import nationalController from './controllers/national';
import ecBreakdownController from './controllers/ec-breakdown';
import pollGraphicsController from './controllers/poll-graphics';
import stateCodeRedirectController from './controllers/state-code-redirect';
import stateController from './controllers/state';
import * as apiController from './controllers/api';
import stateCount from './lib/state-counts';

const cache = lru({
  max: 500,
  maxAge: 60 * 1000, // 60 seconds
});

const template = nunjucks.env;

const app = express();
const maxAge = 120; // for user agent caching purposes
const sMaxAge = 10;

app.disable('x-powered-by');

// run scraper up front if this is a review app
if (process.env.SCRAPE_ON_STARTUP === '1' || process.env.SCRAPE_ON_STARTUP === '"1"') {
  const scraper = require('../scraper').default; // eslint-disable-line global-require

  let stillScraping = true;

  scraper().then(() => {
    stillScraping = false;
  });

  // politely 500 all requests while scraper is still running
  app.use((req, res, next) => {
    if (stillScraping) {
      res.status(500).send('still scraping - please wait then try again');
      return;
    }

    next();
  });
}

app.use('/main.js', babelify('public/main.js'));
app.use(express.static('public', {
  maxAge: app.get('env') === 'production' ? '10m' : 0
}));
app.use(slashes(false));

// utility functions
const setSVGHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}`);
  return res;
};

const setJSONHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  return res;
};

// takes query parameters and orders properly for cache key format
const convertToCacheKeyName = queryRequest => {
  const paramOrder = [
    'background', 'startDate', 'endDate', 'size',
    'type', 'state', 'logo', 'dots', 'key',
  ];

  return paramOrder.reduce((a, b) => a + queryRequest[b], queryRequest.fontless);
};

const makeForecastMap = async chartOpts => {
  const statePollingData = await stateCount();
  const layout = layoutForecastMap(statePollingData, chartOpts);

  if (chartOpts.dots === 'true') return template.render('dot-map.svg', layout);
  return template.render('map.svg', layout);
};

// routes
app.get('/__gtg', (req, res) => {
  res.send('ok');
});

app.get('/favicon.ico', (req, res) => { // explicit override to redirect if favicon is requested
  res.redirect(301, 'https://ig.ft.com/favicon.ico');
});

app.get('/polls/state-polling.json', async (req, res) => {
  const cacheKey = 'state-data-json';
  let value = cache.get(cacheKey);
  if (!value) {
    const count = await stateCount();
    value = Object.keys(count)
      .map(id => count[id]);
    if (value) cache.set(cacheKey, value);
  } else {
    value = false;
  }
  setJSONHeaders(res)
    .send(value);
  return value;
});

app.get('/polls/:state.json', apiController.state);

app.get('/polls.svg', pollGraphicsController);

// Create map of current forecasts
app.get('/forecast-map.svg', async (req, res) => {
  const cacheKey = `forecast-map-svg-${convertToCacheKeyName(req.query)}`;
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

// Create homepage widget of current forecasts
app.get('/ec-forecast-component.:ext', ecForecastComponentController);
app.get('/ec-forecast-component-2.:ext', ecForecastComponentController2);

// Create electoral collecge breakdown
app.get('/ec-breakdown.html', ecBreakdownController);

// This needs to be last as it captures lot of paths and only does redirects
app.get('/:code', stateCodeRedirectController);

const server = app.listen(process.env.PORT || 5000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`running ${host} ${port}`);
});
