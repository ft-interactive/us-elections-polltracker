import axios from 'axios';
import cache from '../lib/cache';

// TODO: hit the republish endpoint on a CRON job or something
const resultURL = 'http://bertha.ig.ft.com/view/publish/gss/17Ea2kjME9yqEUZfQHlPZNc6cqraBUGrxtuHj-ch5Lp4/copy,events,electoralCollege,senate,house,media';

export default function getResult() {
  return cache(
    'results',
    fetchData,
    300 // TODO: review for production
  );
}

function fetchData() {
  return axios.get(resultURL)
        .then(response => {
          const processed = {};
          const ecPct = 100 / 538;
          const copy = response.data.copy.reduce((previous, current) => { previous[current.key] = current.value; return previous; }, {});
          const totals = sumECVotes(response.data.electoralCollege, (d) => d.winner );
          const bestGuess = sumECVotes(response.data.electoralCollege, (d) => {
            if (d.winner) return d.winner;
            return d.leaning;
          });
          const reporting = response.data.electoralCollege.filter( d => (d.winner !== null) ).length;

          const mediaorgs = Object.keys(response.data.media[0].media).map(function(name){
              return {
                  name:name,
                  totals: sumECVotes(response.data.media, (d) => d.media[name] )
              }
          });

          const house = response.data.house[0];
          const senate = response.data.senate[0];

          processed.mediaOrgs = mediaorgs;
          processed.pollClosingTimes = response.data.events;
          processed.electoralCollege = response.data.electoralCollege;
          processed.ecTotals = totals;
          processed.copy = copy;
          processed.overview = {
            timestamp: (new Date()).getTime(),
            senate:{
              total: senate.total,
              dem_pct: (100/senate.total)* senate.current.dem,
              rep_pct: (100/senate.total)* senate.current.rep,
              dem: senate.current.dem,
              rep: senate.current.rep,
            },
            house: {
              total: house.total,
              dem_pct: (100/house.total)* house.current.dem,
              rep_pct: (100/house.total)* house.current.rep,
              dem: house.current.dem,
              rep: house.current.rep,
            },
            president: {
              clinton: totals.d,
              trump: totals.r,
              clinton_pct: ecPct * totals.d,
              trump_pct: ecPct * totals.r,
              bestGuessClinton: bestGuess.d,
              bestGuessTrump: bestGuess.r,
              bestGuessClinton_pct: ecPct * bestGuess.d,
              bestGuessTrump_pct: ecPct * bestGuess.r,
              states_reporting: reporting,
              isFinal: ((totals.r + totals.d) === 538),
            },
          };

          return processed;
        });
}

const projectionCodes = {
  D: 'd',
  R: 'r',
  T: 't',
  LD: 'ld',
  LR: 'lr',
};

const winnerCodes = {
  'D': 'd',
  'R': 'r',
  'IND': 'i',
  'LIB': 'l',
  'GRN': 'g',
};

// TODO: independent!!

function sumECVotes(array, accessor) {
  return array.reduce((totals, current) =>  {
    let winner = accessor(current);

    if (!winner) return totals;

    const code = winnerCodes[winner.toUpperCase()];
    if(!code) return totals;
    totals[code] += current.ecvotes;
    return totals;
  }, { r: 0, d: 0, g: 0, l: 0, i: 0 });
}
