import classifyState from './state-classifications';
import color from './color';
import states from '../data/states';

const groupNames = {
  swing: 'Toss-up',
  leaningRep: 'Leaning',
  rep: 'Solid',
  dem: 'Solid',
  leaningDem: 'Leaning',
};

function splitArray(a, keyFunction) {
  const o = {};
  if (!keyFunction) keyFunction = function (d) { return String(d); };
  a.forEach(function (d) {
      const key = keyFunction(d);
      if (!o[key]) o[key] = [];
      o[key].push(d);
    });
  return o;
}

function combineMENE(lookup) {
    // get a list a
  return lookup;
}

function percentOfCA(votes) { // electoral votes as a proportion of california i.e. california bar is 100% of available width
  return votes / 55 * 100;
}

export default function (stateLookup) {
    // classify the data and sort by electoral college votes
  const states = Object.keys(combineMENE(stateLookup))
        .map(function (key) {
          const state = stateLookup[key];
          const forecast = (state.code === 'ME' || state.code === 'ME')
            ? classifyState.forecastMENE(state.margin) : classifyState.forecast(state.margin);

          return {
            forecast,
            name: stateLookup[key].name,
            code: stateLookup[key].code,
            ecVotes: stateLookup[key].ecVotes,
            barPct: percentOfCA(stateLookup[key].ecVotes),
          };
        })
        .sort((a, b) => b.ecVotes - a.ecVotes);

  const stateGroups = splitArray(states, function (d) { return d.forecast; });

  return {
    title: 'How the states stack up',
    standalone: true,
    fontless: true,
    order: classifyState.forecast.range().reverse(),
    stateGroups,
    groupNames,
    color,
  };
}
