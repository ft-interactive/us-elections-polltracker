import _ from 'underscore';
import axios from 'axios';

import getAllLatestStateAverages from '../../layouts/getAllLatestStateAverages';
import { getSimpleList } from './states';

const STATE_OVERRIDES_URL = (process.env.STATE_OVERRIDES_URL ||
                                'http://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/overrideCategories');
let cachedRequest;

// TODO: replace with a fail stale poller
async function getOverrides() {
  if (cachedRequest) return cachedRequest;

  cachedRequest = axios.get(STATE_OVERRIDES_URL, { timeout: 3000 })
          .then(response =>
            response.data.reduce((map, d) => map.set(d.state, d.overridevalue), new Map())
          )
          .catch(reason => {
            cachedRequest = null;
            if (reason && reason.code === 'ECONNABORTED') {
              return new Map();
            }
            throw reason;
          });
  return cachedRequest;
}

function getPollAvg(data, candidateName) {
  if (!data || !data.length) return null;
  const o = data.find(d => d.candidatename === candidateName);
  if (!o) return null;
  return o.pollaverage;
}

async function latestAveragesByState() {
  return _.groupBy(await getAllLatestStateAverages(), 'state');
}

export default async () => {
  const overrides = await getOverrides();
  const latestAverages = await latestAveragesByState();

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
