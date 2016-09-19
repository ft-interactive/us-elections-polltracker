import _ from 'underscore';
import { isoFormat } from 'd3-time-format';
import { getPollNumCandidatesByCode } from '../lib/states';
import getAllPolls from '../../layouts/getAllPolls';
import getPollAverages from '../../layouts/getPollAverages';
import layoutTimeSeries from '../../layouts/timeseries-layout';
import { render } from '../nunjucks';
import cache from './cache';

async function pollAverages(start, end, state = 'us', pollnumcandidates) {
  return await cache(
    `dbAverages-${state}-${start}-${end}-candidateNum${pollnumcandidates}`,
    async() => await getPollAverages(state, start, end, pollnumcandidates)
  );
}

export async function makePollTimeSeries(chartOpts) {
  const startDate = chartOpts.startDate ? chartOpts.startDate : '2016-07-01 00:00:00';
  const endDate = chartOpts.endDate ? chartOpts.endDate : isoFormat(new Date());
  const state = chartOpts.state ? chartOpts.state : 'us';
  const pollnumcandidates = chartOpts.pollnumcandidates ? chartOpts.pollnumcandidates : 2;
  const pollData = await pollAverages(startDate, endDate, state, pollnumcandidates);
  if (pollData && pollData.length > 0) {
    return render('templated-polls.svg', layoutTimeSeries(pollData, chartOpts));
  }
  return false;
}

async function getPollSVG(state, size = '600x300', pollnumcandidates) {
  return makePollTimeSeries({
    fontless: true,
    notext: true,
    startDate: '2016-07-01T00:00:00',
    size,
    type: 'area',
    state,
    logo: false,
    margin: { top: 10, left: 35, bottom: 50, right: 90 },
    pollnumcandidates,
  });
}

export async function lineChart(code, pollnumcandidates) {
  return {
    default: await getPollSVG(code, '355x200', pollnumcandidates),
    S: await getPollSVG(code, '630x270', pollnumcandidates),
    M: await getPollSVG(code, '603x270', pollnumcandidates),
    L: await getPollSVG(code, '650x288', pollnumcandidates),
    XL: await getPollSVG(code, '680x310', pollnumcandidates),
  };
}

export async function list(code, pollnumcandidates) {
  let allIndividualPolls = await getAllPolls(code.toLowerCase(), pollnumcandidates);
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
  const pollnumcandidates = getPollNumCandidatesByCode(code) || 4;

  const startDate = '2016-07-01 00:00:00';
  const endDate = isoFormat(new Date());
  const pollData = await pollAverages(startDate, endDate, code.toLowerCase(), pollnumcandidates);
  const latestAveragesData = pollData.reverse().slice(0, pollnumcandidates);
  let latestAverages = {};
  if (latestAveragesData.length > 0) {
    latestAverages = {
      Clinton: _.findWhere(latestAveragesData, { candidatename: 'Clinton' }).pollaverage,
      Trump: _.findWhere(latestAveragesData, { candidatename: 'Trump' }).pollaverage,
      Johnson: _.findWhere(latestAveragesData, { candidatename: 'Johnson' }).pollaverage,
      Stein: _.findWhere(latestAveragesData, { candidatename: 'Stein' }).pollaverage,
    };
  }

  return {
    lineCharts: await lineChart(code.toLowerCase(), pollnumcandidates),
    list: await list(code.toLowerCase(), pollnumcandidates),
    latestAverages,
  };
}
