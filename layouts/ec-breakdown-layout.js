import classifyState from './state-classifications';
import color from './color';
import states from '../data/states';


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
    const code = lookup[d].code.substring(0,2); 
    if( newLookup[code] ){ 
      newLookup[code].ecVotes += lookup[d].ecVotes;
    }else{
      newLookup[code] = lookup[d];
    }    
  })
  return newLookup;
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
            shortname: shortname[stateLookup[key].code],
            code: stateLookup[key].code,
            ecVotes: stateLookup[key].ecVotes,
            barPct: percentOfCA(stateLookup[key].ecVotes),
          };
        })
        .sort((a, b) => b.ecVotes - a.ecVotes);

  const stateGroups = splitArray(states, function (d) { return d.forecast; });

  return {
    title: 'Current battleground states',
    standalone: true,
    fontless: true,
    order: classifyState.forecast.range().reverse(),
    stateGroups,
    groupNames,
    color,
  };
}
