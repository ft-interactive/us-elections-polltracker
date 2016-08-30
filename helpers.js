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

  /**
   * This kinda-dense bit of functional programming loops
   * through the data object, creates an array of each state's outcome values,
   * then reduces those to a single array of outcomes, which is then
   * reduced to two values via d3.extent.
   *
   * As such, it returns the extents of all the outcomes in the dataset.
   * @type {Array<Number>}
   */
  const barExtents = d3.extent(Object.keys(data)
    .reduce((last, stateAbbr) => {
      const stateData = data[stateAbbr];
      return last.concat(Object.keys(stateData)
        .filter(label => !!~label.indexOf('outcome'))
        .map(label => (stateData[label] ? Math.abs(stateData[label]) : undefined))
        .filter(i => i));
    }, []));

  d3.extent(Object.keys(data[state.toUpperCase()])
    .filter(label => !!~label.indexOf('outcome'))
    .map(d => Math.abs(data[state.toUpperCase()][d])));

  const barScale = d3.scaleLinear().domain(barExtents).range([0.5, 75]);

  return Object.keys(data[state.toUpperCase()])
    .filter(label => !!~label.indexOf('outcome'))
    .sort()
    .reverse()
    .map((key, i) => ({
      year: key.replace('outcome', ''),
      winningPctScaled: barScale(Math.abs(data[state.toUpperCase()][key])),
      winningPct: Math.abs(data[state.toUpperCase()][key]) * 100,
      stateWinnerColor: data[state.toUpperCase()][key] > 0 ? 'dem' : 'gop',
      dem: !!~winners[i].indexOf('(DEM)') ?
        winners[i].replace(/\s\((GOP|DEM)\)/, '') :
        losers[i].replace(/\s\((GOP|DEM)\)/, ''),
      gop: !!~winners[i].indexOf('(GOP)') ?
        winners[i].replace(/\s\((GOP|DEM)\)/, '') :
        losers[i].replace(/\s\((GOP|DEM)\)/, ''),
      isDemWinner: data[state.toUpperCase()][key] > 0 ? 'dem-winner' : '',
      isGopWinner: data[state.toUpperCase()][key] < 0 ? 'gop-winner' : '',
    }));
}
