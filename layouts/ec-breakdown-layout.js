import { category, keyOrder as categoryOrder } from '../server/lib/margin-category';
import color from './color';

const sum = require('d3-array').sum;

const groupNames = {
  swing: 'Toss-up',
  leaningRep: 'Leaning',
  rep: 'Solid',
  dem: 'Solid',
  leaningDem: 'Leaning',
};

function splitArray(a, keyFunction = String) {
  const o = {};

  a.forEach(d => {
    const key = keyFunction(d);
    if (!o[key]) o[key] = [];
    o[key].push(d);
  });

  return o;
}

function classifyStates(lookup) {
  const newLookup = {};

  Object.keys(lookup).forEach(d => {
    const state = Object.assign({}, lookup[d]);
    const forecast = category(state.margin);
    state.forecast = forecast;
    if (newLookup[`${state.code}-${forecast}`]) {
      newLookup[`${state.code}-${forecast}`].ecVotes += state.ecVotes;
    } else {
      newLookup[`${state.code}-${forecast}`] = state;
    }
  });
  return newLookup;
}

function percentOfCA(votes) { // electoral votes as a proportion of california i.e. california bar is 100% of available width
  return (votes / 55) * 100;
}

export default function (stateLookup) {
    // classify the data and sort by electoral college votes
  const classified = classifyStates(stateLookup);
  const states = Object.keys(classified)
        .map(key => {
          const state = classified[key];
          return {
            forecast: state.forecast,
            code: state.code,
            ecVotes: state.ecVotes,
            barPct: percentOfCA(state.ecVotes),
          };
        })
        .sort((a, b) => b.ecVotes - a.ecVotes);

  const stateGroups = splitArray(states, d => d.forecast);
  const groupTotals = Object.keys(stateGroups).reduce((lookup, groupName) => {
    lookup[groupName] = sum(stateGroups[groupName], d => d.ecVotes); // eslint-disable-line no-param-reassign
    return lookup;
  }, {});

  return {
    title: null,
    standalone: true,
    fontless: true,
    order: categoryOrder,
    stateGroups,
    groupTotals,
    groupNames,
    color,
  };
}
