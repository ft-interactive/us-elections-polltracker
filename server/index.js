import express from 'express';
import lru from 'lru-cache';
import slashes from 'connect-slashes';
import chalk from 'chalk';
import getFlags from '../config/flags';
import * as nunjucks from './nunjucks';
import ecForecastComponentController2 from './controllers/ec-forecast-component-2';
import layoutForecastMap from '../layouts/forecast-map-layout';
import nationalController from './controllers/national';
import ecBreakdownController from './controllers/ec-breakdown';
import pollGraphicsController from './controllers/poll-graphics';
import stateCodeRedirectController from './controllers/state-code-redirect';
import stateController from './controllers/state';
import * as resultController from './controllers/result';
import * as apiController from './controllers/api';
import stateCount from './lib/state-counts';

const cache = lru({
  max: 20000,
  maxAge: 10 * 60 * 1000, // 10 mins
});

const template = nunjucks.env;

const app = express();
app.disable('x-powered-by');

const maxAge = 300; // for user agent caching purposes
const sMaxAge = 60;

const flags = getFlags();
app.locals.flags = flags;

console.log(chalk.magenta('\n\nFlags:'));
for (const name of Object.keys(flags).sort()) {
  console.log(`  ${name} ${chalk.cyan(JSON.stringify(flags[name]))}`);
}
console.log('\n');

// run scraper up front if this is a review app
if (process.env.SCRAPE_ON_STARTUP === '1' || process.env.SCRAPE_ON_STARTUP === '"1"') {
  const scraper = require('../scraper').default; // eslint-disable-line global-require

  let stillInitialising = true;

  scraper(true).then(() => {
    stillInitialising = false;
  });

  // politely 500 all requests while scraper is still running
  app.use((req, res, next) => {
    if (stillInitialising) {
      res.status(500).send('still initialising database - please wait then try again');
      return;
    }
    next();
  });
}

const staticOptions = {
  cacheControl: true,
  etag: false,
  lastModified: true,
  maxAge: '1m',
  setHeaders: function(res, path, stat) {
    res.setHeader('Expires', new Date(Date.now() + 60000).toUTCString());
  }
};

app.use(express.static('dist', staticOptions));
app.use(express.static('public', staticOptions));
app.use(slashes(false));

// utility functions
const setSVGHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', `public, max-age=600, s-maxage=60`);
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

// access_metadata
app.get('/__access_metadata', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(`
    {"access_metadata":[{"path_regex":"/us-elections*","classification":"unconditional"},
    {"path_regex":".*","classification":"unconditional"}]}`);
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
  if (app.locals.flags.results) {
    res.redirect('results');
  } else {
    res.redirect('polls');
  }
});

// convenience redirect in case users inputs it incorrectly
app.get('/polls-:state', (req, res) => {
  res.redirect(301, `${req.params.state}-polls`);
});

app.use((req, res, next) => {
  if (!res.headerSent) {
    res.setHeader('P3P', 'policyref="/w3c/p3p.xml", CP="CAO DSP COR LAW CURa ADMa DEVa TAIa PSAa PSDa CONo OUR DELi BUS IND PHY ONL UNI COM NAV INT DEM PRE OTC"');
  }

  return next();
});

// National poll tracker page
app.get('/polls', nationalController);

// State poll tracker pages
app.get('/:state-polls', stateController);

// support the old state poll format (redirect to new routes)
app.get('/polls/:code', stateCodeRedirectController);

// Create homepage widget of current forecasts
app.get('/ec-forecast-component-2.:ext', ecForecastComponentController2);

// Create electoral collecge breakdown
app.get('/ec-breakdown.html', ecBreakdownController);

// Don't allow access to the page when
// flags.results is false
if (app.locals.flags.results) {
  if (app.locals.flags.resultsFTAuth) {
    const authS3O = require('s3o-middleware'); // eslint-disable-line global-require

    app.set('trust proxy', true);
    app.get('/results', authS3O, resultController.page);
    // National results page
    app.post('/results', authS3O);
  } else {
    app.get('/results', resultController.page);
  }

  // JSON endpoints for Results page client side
  app.get('/full-result.json', resultController.fullResults);
  app.get('/overview-result.json', resultController.resultOverview);
}

// This needs to be last as it captures lot of paths and only does redirects
app.get('/:code', stateCodeRedirectController);

const server = app.listen(process.env.PORT || 5000, () => {
  const { port } = server.address();

  console.log(chalk.magenta(
    app.locals.flags.prod ? `Running on port ${port}` : `Running at http://localhost:${port}/\n`
  ));
});
