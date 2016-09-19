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

import _ from 'underscore';
import axios from 'axios';
import DataRefresher from './data-refresh';
import getAllLatestStateAverages from '../../layouts/getAllLatestStateAverages';
import { getSimpleList } from './states';
import stateReference from '../../data/states';

const STATE_OVERRIDES_URL = (process.env.STATE_OVERRIDES_URL ||
                                'http://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/overrideCategories');

function fetchData() {
  return axios.get(STATE_OVERRIDES_URL, {timeout: 5000}).then(response => {
    if (!Array.isArray(response.data)) {
      throw new Error('Cannot get State override data');
    }

    return response.data.reduce((map, d) =>
                map.set(d.state, d.overridevalue), new Map())
  });
}

const refresher = new DataRefresher('*/50 * * * * *', fetchData);

function getPollAvg(data, candidateName) {
  if (!data || !data.length) return null;
  const o = data.find(d => d.candidatename === candidateName);
  if (!o) return null;
  return o.pollaverage;
}

async function latestAveragesByState(pollnumcandidates) {
  return _.groupBy(await getAllLatestStateAverages(pollnumcandidates), 'state');
}

export default async () => {
  let overrides;

  try {
    overrides = refresher.data || await refresher.tick();
  } catch (err) {
    console.log('Error getting State override data');
    overrides = new Map();
  }

  // temp overrides for current demo
  overrides.set('IN', -8);
  overrides.set('NJ', 12);
  overrides.set('CT', 8);
  overrides.set('MD', 12);

  const latestAverages = await latestAveragesByState(4);
  const latestAverages3Way = await latestAveragesByState(3);

  // use 4 way races but override some states (those with displayRace: 3 in data/states.json) with 3-way data
  const threeWayStates = _.where(stateReference, { displayRace: 3 });
  for (let i = 0; i < threeWayStates.length; i++) {
    const code = threeWayStates[i].code.toLowerCase();
    if (latestAverages3Way[code]) {
      latestAverages[code] = latestAverages3Way[code];
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
    map[state.code] = state;
    return map;
  }, {});
};
