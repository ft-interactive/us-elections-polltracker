require('loud-rejection/register');
import Promise from 'bluebird';

const express = require('express');
const drawChart = require('./layouts/drawChart.js');
const getPollAverages = require('./layouts/getPollAverages.js');
const getAllPolls = require('./layouts/getAllPolls.js');
const nunjucks = require('nunjucks');
const DOMParser = require('xmldom').DOMParser;
const d3 = require('d3');
const lru = require('lru-cache');
const fetch = require('isomorphic-fetch');
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
  const paramOrder = ['background', 'startDate', 'endDate', 'size', 'type', 'state', 'logo'];

  const cacheKey = paramOrder.reduce(function(a, b) {
    return a + queryRequest[b];
  }, queryRequest['fontless']);

  return cacheKey;
}

nunjucks.configure('views', {
  autoescape: true,
  express: app,
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

  const fontless = (req.query.fontless ? req.query.fontless === 'true' : true);
  const background = req.query.background || 'none';
  const startDate = req.query.startDate || 'July 1, 2015';
  const endDate = req.query.endDate || formattedNowDate;
  const [width, height] = (req.query.size || '600x300').split('x');
  const type = req.query.type || 'line';
  const state = req.query.state || 'us';
  const logo = (req.query.logo ? req.query.logo === 'true' : false);

  const queryData = { fontless: fontless, background: background, startDate: startDate, endDate: endDate, size: `${width}x${height}`, type: type, state: state, logo: logo };

  let value = cache.get(convertToCacheKeyName(queryData)); // check if the URL is already in the cache
  if (value) {
    setSVGHeaders(res).send(value);
  } else {
    // weird hack: add one day to endDate to capture the end date in the sequelize query
    const tempEndDatePieces = endDate.replace(/\s{2}/, ' ').split(' ');
    const queryEndDate = tempEndDatePieces[0] + ' ' + (+tempEndDatePieces[1].replace(/,/g, '') + 1) + ', ' + tempEndDatePieces[2];

    const data = await getPollAverages(state, startDate, queryEndDate);

    try {
      const chartLayout = await drawChart(width, height, fontless, background, logo, startDate, endDate, type, data);
      value = nunjucks.render('poll.svg', chartLayout);
      cache.set(convertToCacheKeyName(queryData), value);
      setSVGHeaders(res).send(value);
    } catch (error) {
      console.error(error);
      res.status(500).send('something broke');
    }
  }
});

app.get('/polltracker-landing.html', async (req, res) => {
  const url = 'https://ft-ig-us-elections-polltracker.herokuapp.com/polls.svg?fontless=true&startDate=June%207,%202016&size=600x300&type=area&state=us&logo=false';
  const pollRes = await Promise.resolve(fetch(url))
    .timeout(10000, new Error(`Timeout - bertha took too long to respond: ${url}`));
  if (!pollRes.ok) throw new Error(`Request failed with ${res.status}: ${url}`);
  const pollSVG = await pollRes.text();

  let allIndividualPolls = await getAllPolls('us');
  allIndividualPolls = _.groupBy(allIndividualPolls, 'rcpid');
  allIndividualPolls = _.values(allIndividualPolls);
  const formattedIndividualPolls = [];
  _.each(allIndividualPolls, function(poll) {
    let winner = '';
    const clintonVal = _.findWhere(poll, {'candidatename': 'Clinton'}).pollvalue;
    const trumpVal = _.findWhere(poll, {'candidatename': 'Trump'}).pollvalue;

    if (clintonVal > trumpVal) {
      winner = 'Clinton'
    }

    if (trumpVal > clintonVal) {
      winner = 'Trump';
    }

    formattedIndividualPolls.push({
      Clinton: _.findWhere(poll, {'candidatename': 'Clinton'}).pollvalue,
      Trump: _.findWhere(poll, {'candidatename': 'Trump'}).pollvalue,
      date: poll[0].date,
      pollster: poll[0].pollster,
      sampleSize: poll[0].sampleSize,
      winner: winner,
    });
  });

  const polltrackerLayout = {
    pollSVG: pollSVG,
    pollList: formattedIndividualPolls,
  };
  const value = nunjucks.render('polltracker-landing.html', polltrackerLayout);
  res.send(value);
});

const server = app.listen(process.env.PORT || 5000, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`running ${host} ${port}`);
});
