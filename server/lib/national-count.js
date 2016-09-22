/*
returns a summary of electoral college predictions in the form ...
{ dem: 202, leaningDem: 71, swing: 101, leaningRep: 80, rep: 84 }
you can stateData (from eg. state-counts.js) but if you don't it'll go and get it for you
*/

import * as d3 from 'd3';
import stateCount from '../lib/state-counts';

export const marginThreshold = d3.scale.scaleThreshold()
  .range(['rep', 'leaningRep', 'swing', 'leaningDem', 'dem'])
  .domain([-10, -5, 5, 10]);

export default async _stateData => {
  // if state data is not supplied go get it
  const stateData = _stateData || await stateCount();

  const stateCounts = Object.keys(stateData)
    .reduce((cumulative, stateCode) => {
      const state = stateData[stateCode];
      cumulative[marginThreshold(state.margin)] += state.ecVotes; // eslint-disable-line no-param-reassign
      return cumulative;
    }, {
      dem: 0,
      leaningDem: 0,
      swing: 0,
      leaningRep: 0,
      rep: 0,
    })
  ;

  return stateCounts;
};
