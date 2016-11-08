/*
returns an object of objects keyed by state abbreviation
  { WY:
   { slug: 'wyoming',
     name: 'Wyoming',
     fullname: 'Wyoming',
     ecVotes: 3,
     code: 'WY',
     Trump: null,
     Clinton: null,
     margin: -12 } }
  ... }
*/

import _ from 'lodash';
import axios from 'axios';
import DataRefresher from './data-refresh';
import { getSimpleList } from './states';
import stateReference from '../../data/states';
import db from '../../models';

// runs a psql query to get the latest polling averages
// for all states (choose 3 or 4-way based on displayRace)
const latestAveragesByState = pollnumcandidates =>
  db.sequelize.query(
    `SELECT * FROM (SELECT ROW_NUMBER() OVER (PARTITION BY state ORDER BY date DESC) AS r, t.* FROM (SELECT * FROM "Pollaverages" WHERE pollnumcandidates = ${pollnumcandidates}) t) x WHERE x.r <= ${pollnumcandidates};`,
    { type: db.sequelize.QueryTypes.SELECT }
  ).then(data => _.groupBy(data, 'state'));

const STATE_OVERRIDES_URL = process.env.STATE_OVERRIDES_URL ||
  'http://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/overrideCategories'
;

function fetchData() {
  return axios.get(STATE_OVERRIDES_URL, { timeout: 10000 }).then(response => {
    if (!Array.isArray(response.data)) {
      throw new Error('Cannot get State override data');
    }

    return response.data.reduce((map, d) => map.set(d.state, d.overridevalue), new Map());
  });
}

function fetchError(error) {
  if (error instanceof Error) {
    const url = error.config && error.config.url;
    console.error(error.message, error.code, url);
  } else {
    console.error(error);
  }
}

const overrideData = new DataRefresher('* */5 * * * *', fetchData, { fallbackData: new Map(), logErrors: false });

overrideData.on('error', fetchError);

function getPollAvg(data, candidateName) {
  if (!data || !data.length) return null;
  const o = data.find(d => d.candidatename === candidateName);
  if (!o) return null;
  return o.pollaverage;
}

export default async () => {
  const overrides = await overrideData.promise();

  const latestAverages = await latestAveragesByState(4);
  const latestAverages3Way = await latestAveragesByState(3);
  const latestAverages5Way = await latestAveragesByState(5);

  // use 4 way races but override some states (those with displayRace: 3 in data/states.json) with 3/5-way data
  const not4WayStates = _.filter(stateReference, state => state.displayRace != null && state.displayRace != 4);
  for (let i = 0; i < not4WayStates.length; i += 1) {
    const code = not4WayStates[i].code.toLowerCase();
    const pollWay = not4WayStates[i].displayRace;

    let newStateAverage = latestAverages3Way;
    if (pollWay === 5) {
      newStateAverage = latestAverages5Way;
    }

    if (newStateAverage[code]) {
      latestAverages[code] = newStateAverage[code];
    } else {
      delete latestAverages[code];
    }
  }

  return getSimpleList().map(state => {
    const pollAvg = latestAverages[state.code.toLowerCase()];
    const Trump = getPollAvg(pollAvg, 'Trump');
    const Clinton = getPollAvg(pollAvg, 'Clinton');
    const override = overrides ? overrides.get(state.code) : null;
    const margin = Number.isFinite(Clinton) && Number.isFinite(Trump)
                                ? Clinton - Trump : override;
    return { ...state, Trump, Clinton, margin };
  }).reduce((map, state) => {
    map[state.code] = state; // eslint-disable-line no-param-reassign
    return map;
  }, {});
};
