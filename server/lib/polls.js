import _ from 'underscore';
import { isoFormat, timeFormat } from 'd3-time-format';
import getAllPolls from '../../layouts/getAllPolls';
import getPollAverages from '../../layouts/getPollAverages';
import layoutTimeSeries from '../../layouts/timeseries-layout';
import { render } from '../nunjucks';
import cache from './cache';

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

async function getPollSVG(state, size = '600x300') {
  return makePollTimeSeries({
    fontless: true,
    notext: true,
    startDate: '2016-06-01T00:00:00',
    size,
    type: 'area',
    state,
    logo: false,
    margin: { top: 10, left: 35, bottom: 50, right: 90 },
  });
}

async function makePollTimeSeries(chartOpts) {
  const startDate = chartOpts.startDate ? chartOpts.startDate : '2016-06-01 00:00:00';
  const endDate = chartOpts.endDate ? chartOpts.endDate : isoFormat(new Date());
  const state = chartOpts.state ? chartOpts.state : 'us';
  const pollData = await pollAverages(startDate, endDate, state);
  if (pollData && pollData.length > 0) {
    return render('templated-polls.svg', layoutTimeSeries(pollData, chartOpts));
  }
  return false;
}

export async function lineChart(code) {
  return {
    default: await getPollSVG(code, '355x200'),
    S: await getPollSVG(code, '630x270'),
    M: await getPollSVG(code, '603x270'),
    L: await getPollSVG(code, '650x288'),
    XL: await getPollSVG(code, '680x310'),
  };
}

export async function list(code) {
  let allIndividualPolls = await getAllPolls(code.toLowerCase());
  allIndividualPolls = _.groupBy(allIndividualPolls, 'rcpid');
  allIndividualPolls = _.values(allIndividualPolls);
  const formattedIndividualPolls = [];
  _.each(allIndividualPolls, poll => {
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

  return formattedIndividualPolls;
}

export async function pollHistory(code) {
  return {
    lineCharts: await lineChart(code.toLowerCase()),
    list: await list(code.toLowerCase()),
  };
}
