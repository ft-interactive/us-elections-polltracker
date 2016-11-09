import _ from 'lodash';
import * as d3 from 'd3';
import moment from 'moment';
import nationalReference from '../../data/national';
import db from '../../models';
import { getByCode } from './states';
import layoutTimeSeries from '../../layouts/timeseries-layout';
import { render } from '../nunjucks';
import cache from './cache';

const deleteTimezoneOffset = d3.timeFormat('%B %e, %Y');

const getAllPolls = (state, pollnumcandidates) => db.Polldata.findAll({
  where: { state: state.toLowerCase(), pollnumcandidates },
  order: [['endDate', 'ASC']],
  raw: true,
});

// TODO: start and end must be dates not strings
export const pollAverages = async (_start, _end, _state, pollnumcandidates = 4) => {
  // to capture data from anytime during the day (and timezone offsets), set endDate
  // to the start of the next day

  if (!_state) throw new Error('No start date');
  if (!_end) throw new Error('No end date');

  const start = moment(_start).startOf('day').format();
  const end = moment(_end).endOf('day').format();
  const state = _state.toLowerCase();
  const cacheKey = `dbAverages-${state}-${start.replace(/T.*/,'')}-${end.replace(/T.*/,'')}-${pollnumcandidates}`;
  const query = () => {
    return db.Pollaverages.findAll({
      where: { state, pollnumcandidates, date: { $gte: start, $lte: end }},
      order: [['date', 'ASC']],
      raw: true,
    }).then(data =>
      data.map(row => {
        row.date = new Date(deleteTimezoneOffset(row.date));
        return row;
      })
    );
  }

  return cache(cacheKey, query, 30000);
};

export const makePollTimeSeries = async chartOpts => {
  const startDate = chartOpts.startDate ? chartOpts.startDate : '2016-07-01T00:00:00Z';
  const endDate = chartOpts.endDate ? chartOpts.endDate : d3.isoFormat(new Date());
  const state = chartOpts.state ? chartOpts.state : 'us';

  const defaultPollNumCandidates = 4;
  let numcandidates;
  if (state === 'us') {
    numcandidates = nationalReference[0].displayRace;
  } else {
    numcandidates = getByCode(state).displayRace;
  }

  const pollnumcandidates = (chartOpts.pollnumcandidates ?
    chartOpts.pollnumcandidates :
    numcandidates || defaultPollNumCandidates
  );

  const pollData = await pollAverages(startDate, endDate, state, pollnumcandidates);

  if (pollData && pollData.length > 0) {
    return render('templated-polls.svg', layoutTimeSeries(pollData, chartOpts));
  }
  return false;
};

const getPollSVG = async (state, size = '600x300', pollnumcandidates) => {
  let yAxisDomain = '30-60';
  if (state === 'ut' || state === 'md' || state === 'ma' || state === 'or' || state === 'vt') {
    yAxisDomain = null;
  }

  return makePollTimeSeries({
    fontless: true,
    notext: true,
    startDate: '2016-07-01T00:00:00',
    size,
    type: 'area',
    state,
    logo: false,
    margin: { top: 10, left: 35, bottom: 50, right: 110 },
    pollnumcandidates,
    outlineColor: 'fff1e0',
    yAxisDomain,
  });
};

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
  let allIndividualPolls = await getAllPolls(code, pollnumcandidates);
  allIndividualPolls = _.groupBy(allIndividualPolls, 'rcpid');
  allIndividualPolls = _.values(allIndividualPolls);
  allIndividualPolls = _.orderBy(allIndividualPolls, d => d[0].endDate);
  const formattedIndividualPolls = [];
  _.each(allIndividualPolls, poll => {
    let winner = '';
    const clintonVal = _.find(poll, _.iteratee({ candidatename: 'Clinton' })).pollvalue;
    const trumpVal = _.find(poll, _.iteratee({ candidatename: 'Trump' })).pollvalue;

    let mcMullinVal = null;
    if (_.find(poll, _.iteratee({ candidatename: 'McMullin' }))) mcMullinVal = _.find(poll, _.iteratee({ candidatename: 'McMullin' })).pollvalue;

    if (clintonVal > trumpVal) {
      winner = 'Clinton';
    }

    if (trumpVal > clintonVal) {
      winner = 'Trump';
    }

    if (mcMullinVal > clintonVal && mcMullinVal > trumpVal) {
      winner = 'McMullin';
    }

    // unshift instead of push because dates keep being in chron instead of reverse chron
    // even when I change the pg query to order by endDate DESC
    formattedIndividualPolls.unshift({
      Clinton: clintonVal,
      Trump: trumpVal,
      McMullin: mcMullinVal,
      date: poll[0].date,
      pollster: poll[0].pollster.replace(/\*$/, '').replace(/\//g, ', '), // get rid of asterisk b/c RCP doesn't track what it means
      sampleSize: poll[0].sampleSize,
      winner,
    });
  });

  return formattedIndividualPolls;
}

export async function pollHistory(code) {
  const defaultPollNumCandidates = 4;
  let numcandidates;
  if (code.toUpperCase() === 'US') {
    numcandidates = nationalReference[0].displayRace;
  } else {
    numcandidates = getByCode(code.toUpperCase()).displayRace;
  }

  const pollnumcandidates = numcandidates || defaultPollNumCandidates;

  const startDate = '2016-07-01T00:00:00Z';
  const endDate = '2016-11-08T00:00:00Z';
  const pollData = await pollAverages(startDate, endDate, code, pollnumcandidates);
  const latestAveragesData = pollData.concat().reverse().slice(0, pollnumcandidates);
  let latestAverages = {};
  if (latestAveragesData.length > 0) {
    let steinPollAverage = null;
    let mcMullinPollAverage = null;

    if (_.find(latestAveragesData, _.iteratee({ candidatename: 'Stein' }))) {
      steinPollAverage = _.find(latestAveragesData, _.iteratee({ candidatename: 'Stein' })).pollaverage;
    }
    if (_.find(latestAveragesData, _.iteratee({ candidatename: 'McMullin' }))) {
      mcMullinPollAverage = _.find(latestAveragesData, _.iteratee({ candidatename: 'McMullin' })).pollaverage;
    }

    latestAverages = {
      Clinton: _.find(latestAveragesData, _.iteratee({ candidatename: 'Clinton' })).pollaverage,
      Trump: _.find(latestAveragesData, _.iteratee({ candidatename: 'Trump' })).pollaverage,
      Johnson: _.find(latestAveragesData, _.iteratee({ candidatename: 'Johnson' })).pollaverage,
      Stein: steinPollAverage,
      McMullin: mcMullinPollAverage,
    };
  }

  return {
    lineCharts: await lineChart(code.toLowerCase(), pollnumcandidates),
    list: await list(code, pollnumcandidates),
    pollnumcandidates,
    latestAverages,
  };
}
