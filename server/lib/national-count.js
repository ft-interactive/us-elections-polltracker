/* 
returns a summary of electoral college predictions in the form ... 
{ dem: 202, leaningDem: 71, swing: 101, leaningRep: 80, rep: 84 }
you can stateData (from eg. state-counts.js) but if you don't it'll go and get it for you
*/

import { scaleThreshold } from 'd3-scale';
import stateCount from '../lib/state-counts';

import classifyState from '../../layouts/state-classifications';

export const marginThreshold = classifyState.forecast;

export default async function nationalCount(stateData) {
  // if state data is not supplied go get it
  if(!stateData) stateData = await stateCount();

  const stateCounts = Object.keys(stateData).reduce((cumulative, stateCode) => {
    const state = stateData[stateCode];
    const forecast = (state.code.substring(0,2) === 'ME' || state.code.substring(0,2) === 'NE')
      ? classifyState.forecastMENE(state.margin) : classifyState.forecast(state.margin);

    cumulative[forecast] += state.ecVotes;
    return cumulative;
  }, {
    dem: 0,
    leaningDem: 0,
    swing: 0,
    leaningRep: 0,
    rep: 0 });
  return stateCounts;
}
