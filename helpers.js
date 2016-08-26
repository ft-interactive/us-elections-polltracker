/**
 * Various helper functions
 */

// Defining D3 globally because it's used everywhere.
const d3 = require('d3');

/**
 * This munges the stateDemographicsData for the "Who Won Here?" table.
 * @param  {Object} data  Contents of const stateDemographicsData
 * @param  {String} state State abbreviation
 * @return {Array}        Array of results split into years.
 */
export function getHistoricalResults(data, state) {
  const winners = Object.keys(data.label)
    .filter(label => !!~label.indexOf('outcome'))
    .sort()
    .reverse()
    .map(outcome => data.label[outcome]);

  const losers = Object.keys(data.label)
    .filter(label => !!~label.indexOf('loser'))
    .sort()
    .reverse()
    .map(outcome => data.label[outcome]);

  const barExtents = d3.extent(Object.keys(data[state.toUpperCase()])
    .filter(label => !!~label.indexOf('outcome'))
    .map(d => Math.abs(data[state.toUpperCase()][d])));

  const barScale = d3.scaleLinear().domain(barExtents).range([2, 80]);

  return Object.keys(data[state.toUpperCase()])
    .filter(label => !!~label.indexOf('outcome'))
    .sort()
    .reverse()
    .map((key, i) => ({
      year: key.replace('outcome', ''),
      winningPctScaled: barScale(Math.abs(data[state.toUpperCase()][key])),
      winningPct: Math.abs(data[state.toUpperCase()][key]) * 100,
      stateWinnerColor: data[state.toUpperCase()][key] > 0 ? 'dem' : 'gop',
      dem: !!~winners[i].indexOf('(DEM)') ? winners[i].replace(/\s\((GOP|DEM)\)/, '') : losers[i].replace(/\s\((GOP|DEM)\)/, ''),
      gop: !!~winners[i].indexOf('(GOP)') ? winners[i].replace(/\s\((GOP|DEM)\)/, '') : losers[i].replace(/\s\((GOP|DEM)\)/, ''),
      isDemWinner: data[state.toUpperCase()][key] > 0 ? 'dem-winner' : '',
      isGopWinner: data[state.toUpperCase()][key] < 0 ? 'gop-winner' : '',
    }));
}
