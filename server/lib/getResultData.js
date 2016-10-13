import axios from 'axios';

const resultURL = 'http://bertha.ig.ft.com/republish/publish/gss/17Ea2kjME9yqEUZfQHlPZNc6cqraBUGrxtuHj-ch5Lp4/copy,events,electoralCollege,senate,house,media';

export default async function getResult() {
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

          processed.pollClosingTimes = response.data.events;
          processed.electoralCollege = response.data.electoralCollege;
          processed.ecTotals = totals;
          processed.copy = copy;
          processed.overview = {
            timestamp: (new Date()).getTime(),
            senate: Object.assign({ total: response.data.senate[0].total }, response.data.senate[0].current),
            house: Object.assign({ total: response.data.house[0].total }, response.data.house[0].current),
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

function sumECVotes(array, accessor) {
  return array.reduce((totals, current) =>  {
    const winner = accessor(current);
    totals[winner] += current.ecvotes;
    return totals;
  }, { r: 0, d: 0, g: 0, l: 0 });
}
