import classifyState from './state-classifications';
import color from './color';
import states from '../data/states';
const sum =require('d3-array').sum;

function makeLookup(arr,key,value){
  const o = {};
  arr.forEach(function(d){
    o[ d[key] ] = value(d);
  })
  return o;
}

const shortname = makeLookup(states,'code',function(d){ 
  if(d.shortName){
    return d.shortName;
  }
  return d.name;
});

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
  const newLookup = {};

  Object.keys(lookup).forEach(function(d){
    //const code = lookup[d].code.substring(0 ,2);
    const state = Object.assign({}, lookup[d]);
    state.code = state.code.substring(0,2);
    const forecast = classifyState.forecast(state.margin);
    state.forecast = forecast;
    if ( newLookup[state.code + '-' + forecast]){ 
      newLookup[state.code + '-' + forecast].ecVotes += state.ecVotes;
    } else {
      newLookup[state.code + '-' + forecast] = state;
    }    
  });
  return newLookup;
}

function percentOfCA(votes) { // electoral votes as a proportion of california i.e. california bar is 100% of available width
  return votes / 55 * 100;
}

export default function (stateLookup) {
    // classify the data and sort by electoral college votes
  const classified = combineMENE(stateLookup);
  const states = Object.keys(classified)
        .map(function (key) {
          const state = classified[key];
          return {
            forecast: state.forecast,
            code: state.code,
            ecVotes: state.ecVotes,
            barPct: percentOfCA(state.ecVotes),
          };
        })
        .sort((a, b) => b.ecVotes - a.ecVotes);

  const stateGroups = splitArray(states, function (d) { return d.forecast; });
  const groupTotals = Object.keys(stateGroups).reduce(function(lookup, groupName){
    //console.log(lookup);
    lookup[groupName] = sum( stateGroups[groupName], d => d.ecVotes );
    return lookup;
  },{});

  console.log(groupTotals);

  return {
    title: 'Where are the battleground states?',
    standalone: true,
    fontless: true,
    order: classifyState.forecast.range().reverse(),
    stateGroups,
    groupTotals,
    groupNames,
    color,
  };
}
