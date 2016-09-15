import classifyState from './state-classifications';

export default function (stateLookup) {
    // classify the data and sort by electoral college votes
  const states = Object.keys(stateLookup)
        .map(function (key) {
          const state = stateLookup[key];
          const forecast = (state.code === 'ME' || state.code === 'ME')
            ? classifyState.forecastMENE(state.margin) : classifyState.forecast(state.margin);

          return Object.assign({ forecast }, stateLookup[key]);
        })
        .sort((a, b) => b.ecVotes - a.ecVotes);

  const stateGroups = splitArray(states, function (d) { return d.forecast; });

  return {
    title: 'Electoral college breakdown',
    fontless: false,
    order: classifyState.forecast.range(),
    stateGroups,
  };
}


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
