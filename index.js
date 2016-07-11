require('loud-rejection/register');

const express = require('express');
const drawPollAvgChart = require('./layouts/drawPollAvgChart.js');
const drawMarginsChart = require('./layouts/drawMarginsChart.js');
const getPollData = require('./layouts/getPollData.js');
const nunjucks = require('nunjucks');
const DOMParser = require('xmldom').DOMParser;
const d3 = require('d3');
const lru = require('lru-cache');
const _ = require('underscore');

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
  const paramOrder = ['fontless', 'background', 'startDate', 'endDate', 'size', 'type', 'state'];
  let cacheKey = '';
  for (let i = 0; i < paramOrder.length; i++) {
    const param = paramOrder[i];
    cacheKey = cacheKey + queryRequest[param];
  }
  cacheKey = cacheKey.replace(/\s+/g, '');
  return cacheKey;
}

nunjucks.configure('views', {
  autoescape: true,
  express: app,
}).addFilter('rawSVG', fragment => {
  const parser = new DOMParser();
  return parser.parseFromString(fragment, 'image/svg+xml');
});

const cache = lru({
  max: 500,
  maxAge: 60 * 1000, // 60 seconds
});

// routes
app.get('/__gtg', (req, res) => {
  res.send('ok');
});

app.get('/', (req, res) => {
  res.send('The format for URLs is: https://ft-ig-us-elections-polltracker.herokuapp.com/polls.svg?size=600x300&type=both&startDate=July%201,%202015&endDate=November%208,%202016&fontless=true&background=fff1e0&state=us');
});

app.get('/polls.svg', async (req, res) => {
  const nowDate = new Date().toString().split(' ')
    .slice(1, 4)
    .join(' ');

  const formattedNowDate = d3.timeFormat('%B %e, %Y')((d3.timeParse('%b %d %Y')(nowDate)));

  const fontless = (req.query.fontless ? req.query.fontless : true);
  const background = req.query.background;
  const startDate = req.query.startDate || 'July 1, 2015';
  const endDate = req.query.endDate || formattedNowDate;
  const [width, height] = (req.query.size || '600x300').split('x');
  const type = req.query.type || 'margins';
  const state = req.query.state || 'us';

  const queryData = { fontless: fontless, background: background, startDate: startDate, endDate: endDate, size: `${width}x${height}`, type: type, state: state };

  let value = cache.get(convertToCacheKeyName(queryData)); // check if the URL is already in the cache
  if (value) {
    setSVGHeaders(res).send(value);
  } else {
    // weird hack: add one day to endDate to capture the end date in the sequelize query
    const tempEndDatePieces = endDate.replace(/\s{2}/, ' ').split(' ');
    const queryEndDate = tempEndDatePieces[0] + ' ' + (+tempEndDatePieces[1].replace(/,/g, '') + 1) + ', ' + tempEndDatePieces[2];

    let data = await getPollData(state, startDate, queryEndDate);

    try {

      let chartLayout;

      switch (type) {
        case 'pollAvg':
          data = _.groupBy(data, (row) => row.candidatename);
          chartLayout = await drawPollAvgChart(width, height, fontless, background, startDate, endDate, type, data);
          break;
        case 'margins':
          data = _.groupBy(data, (row) => row.date);
          chartLayout = await drawMarginsChart(width, height, fontless, background, startDate, endDate, type, data);
          break;
        default:
          data = _.groupBy(data, (row) => row.date);
          chartLayout = await drawMarginsChart(width, height, fontless, background, startDate, endDate, type, data);
          break;
      }

      value = nunjucks.render('poll.svg', chartLayout);
      cache.set(convertToCacheKeyName(queryData), value);
      setSVGHeaders(res).send(value);
    } catch (error) {
      console.error(error);
      res.status(500).send('something broke');
    }
  }
});

const server = app.listen(process.env.PORT || 5000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`running ${host} ${port}`);
});
