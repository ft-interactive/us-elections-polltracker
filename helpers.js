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
  /**
   * This creates an object matching each year to the candidate
   * from each party.
   * @type {Object}
   */
  const candidates = Object.keys(data.label)
    .filter(label => !!~label.indexOf('outcome'))
    .reduce((last, outcome) => {
      const year = outcome.replace('outcome', '');
      last[outcome] = { // eslint-disable-line no-param-reassign
        dem: !!~data.label[outcome].indexOf('(DEM)') ?
          data.label[outcome].replace(' (DEM)', '') :
          data.label[`loser${year}`].replace(' (DEM)', ''),
        gop: !!~data.label[outcome].indexOf('(GOP)') ?
          data.label[outcome].replace(' (GOP)', '') :
          data.label[`loser${year}`].replace(' (GOP)', ''),
      };
      return last;
    }, {});

  /**
   * This creates an array of federal winners, in reverse-chronological
   * order.
   * @type {Array<String>}
   */
  const winnersFederal = Object.keys(data.label)
    .filter(label => !!~label.indexOf('outcome'))
    .sort()
    .reverse()
    .map(outcome => data.label[outcome]);

  /**
   * Same as the above, but for the selected state.
   * @type {Array<String>}
   */
  const winnersState = Object.keys(data[state.toUpperCase()])
    .filter(label => !!~label.indexOf('outcome'))
    .sort()
    .reverse()
    .map(outcome => (data[state.toUpperCase()][outcome] > 0 ?
      candidates[outcome].dem :
      candidates[outcome].gop)
    );

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

  /**
   * This scale is used to draw the length of the bars.
   * Notice range() — 0.5 is to prevent small values from being invisible,
   * 75 is used to pad the end for the 5-character percentage value.
   * @type {d3.Scale}
   */
  const barScale = d3.scaleLinear().domain(barExtents).range([0.5, 75]);

  /**
   * Finally, iterate through each "outcome" and return an object munging
   * all the above together.
   */
  return Object.keys(data[state.toUpperCase()])
    .filter(label => !!~label.indexOf('outcome'))
    .sort()
    .reverse()
    .map((key, i) => ({
      year: key.replace('outcome', ''),
      winningPctScaledState: barScale(Math.abs(data[state.toUpperCase()][key])),
      winningPctState: Math.abs(data[state.toUpperCase()][key]) * 100,
      stateWinnerColor: data[state.toUpperCase()][key] > 0 ? 'dem' : 'gop',
      winnerState: winnersState[i].replace(/\((DEM|GOP)\)/, ''),
      winningPctScaledFederal: barScale(Math.abs(data.label[key.replace('outcome', 'margin')])),
      winningPctFederal: Math.abs(data.label[key.replace('outcome', 'margin')]) * 100,
      federalWinnerColor: data.label[key.replace('outcome', 'margin')] > 0 ? 'dem' : 'gop',
      winnerFederal: winnersFederal[i].replace(/\((DEM|GOP)\)/, ''),
    }));
}
