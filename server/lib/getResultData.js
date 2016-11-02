import axios from 'axios';
import cache from '../lib/cache';

// TODO: hit the republish endpoint on a CRON job or something
const resultURL = 'http://bertha.ig.ft.com/view/publish/gss/17Ea2kjME9yqEUZfQHlPZNc6cqraBUGrxtuHj-ch5Lp4/copy,electoralCollege,senate,house,media';

export default function getResult() {
  return cache(
    'results',
    fetchData,
    300 // TODO: review for production
  );
}

const partyCodes = {
  'R': 'r',
  'r': 'r',
  'LR':'r',
  'D': 'd',
  'd': 'd',
  'LD': 'd',
  'I': 'i',
  'i': 'i',
  'G': 'g',
  'L': 'l',
};

function sumECVotes(array, accessor) {
  return array.reduce((totals, current) => {
    const winner = accessor(current);
    if (winner == null) return totals;
    totals[winner] += current.ecvotes;
    return totals;
  }, { r: 0, d: 0, g: 0, l: 0 });
}

function fetchData() {
  return axios.get(resultURL)
        .then(response => {
          const lastModified = new Date(response.headers['last-modified']);
          const processed = {};
          const ecPct = 100 / 538;
          const copy = response.data.copy.reduce((previous, current) => { previous[current.key] = current.value; return previous; }, {});
          const totals = sumECVotes(response.data.electoralCollege, d => partyCodes[d.winner]);
          const bestGuess = sumECVotes(response.data.electoralCollege, d => {
            if (d.winner) return partyCodes[d.winner];
            return partyCodes[d.liveestimate];
          });
          const reporting = response.data.electoralCollege.filter(d => (d.winner !== null)).length;

          const house = response.data.house[0];
          const senate = response.data.senate[0];

          processed.mediaOrgs = response.data.media.map( function(d){
            let dem_pct = (d.result.clinton / 538) * 100;
            let rep_pct = (d.result.trump / 538) * 100;

            if (rep_pct + dem_pct > 100) {
              const dif = rep_pct+dem_pct - 100;
              dem_pct -= dif/2;
              rep_pct -= dif/2;
            };

            return {
              name: d.name,
              link: d.link,
              dem_pct: dem_pct,
              dem_initial_pct: 0,
              rep_pct: rep_pct,
              rep_initial_pct: 0,
              dem: d.result.clinton,
              rep: d.result.trump,
            };
          });


          processed.pollClosingTimes = response.data.events;
          processed.electoralCollege = response.data.electoralCollege.map(d => {
            const o = {};
            Object.assign(o, d);
            o.winner = partyCodes[o.winner];
            return o;
          });
          processed.ecTotals = totals;
          processed.copy = copy;
          processed.overview = {
            timestamp: lastModified.getTime(),
            senate: {
              total: senate.total,
              dem_pct: (senate.current.dem / senate.total) * 100,
              dem_initial_pct: (senate.initial.dem / senate.total) * 100,
              rep_pct: (senate.current.rep / senate.total) * 100,
              rep_initial_pct: (senate.initial.rep / senate.total) * 100,
              dem: senate.current.dem,
              rep: senate.current.rep,
            },
            house: {
              total: house.total,
              dem_pct: (house.current.dem / house.total) * 100,
              dem_initial_pct: (house.initial.dem / house.total) * 100,
              rep_pct: (house.current.rep / house.total) * 100,
              rep_initial_pct: (house.initial.rep / house.total) * 100,
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
