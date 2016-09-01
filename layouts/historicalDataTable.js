/**
 * Historical Results table
 */

import { scaleLinear, extent } from 'd3';

const MINIMUM_BAR_VALUE = 0.5;
const BAR_RIGHT_PADDING = 0;

/**
 * This creates an object matching each year to the candidate
 * from each party.
 * @returns {Object}
 */
export function getCandidatesList(data) {
  return Object.keys(data.label)
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
}

/**
 * This creates an array of federal winners, in reverse-chronological
 * order.
 * @returns {Array<String>}
 */
export function getFederalWinners(data) {
  return Object.keys(data.label)
    .filter(label => !!~label.indexOf('outcome'))
    .sort()
    .reverse()
    .map(outcome => data.label[outcome]);
}

/**
 * Same as the above, but for the selected state.
 * @returns {Array<String>}
 */
export function getStateWinners(data, state, candidates) {
  return Object.keys(data[state.toUpperCase()])
    .filter(label => !!~label.indexOf('outcome'))
    .sort()
    .reverse()
    .map(outcome => (data[state.toUpperCase()][outcome] > 0 ?
      candidates[outcome].dem :
      candidates[outcome].gop)
    );
}

/**
 * This kinda-dense bit of functional programming loops
 * through the data object, creates an array of each state's outcome values,
 * then reduces those to a single array of outcomes, which is then
 * reduced to two values via d3.extent.
 *
 * As such, it returns the extents of all the outcomes in the dataset.
 * @returns {Array<Number>}
 */
export function getBarExtents(data) {
  return extent(Object.keys(data)
    .reduce((last, stateAbbr) => {
      const stateData = data[stateAbbr];
      return last.concat(Object.keys(stateData)
        .filter(label => !!~label.indexOf('outcome'))
        .map(label => (stateData[label] ? Math.abs(stateData[label]) : undefined))
        .filter(i => i));
    }, []));
}

/**
 * This munges the stateDemographicsData for the "Who Won Here?" table.
 * @param  {Object} data  Contents of const stateDemographicsData
 * @param  {String} state State abbreviation
 * @return {Array}        Array of results split into years.
 */
export default function getHistoricalResults(data, state) {
  const candidates = getCandidatesList(data);
  const winnersFederal = getFederalWinners(data);
  const winnersState = getStateWinners(data, state, candidates);
  const barExtents = getBarExtents(data);

  /**
   * This scale is used to draw the length of the bars.
   * Notice range() — 0.5 is to prevent small values from being invisible,
   * 75 is used to pad the end for the 5-character percentage value.
   * @type {d3.Scale}
   */
  const barScale = scaleLinear()
    .domain(barExtents)
    .range([MINIMUM_BAR_VALUE, 100 - BAR_RIGHT_PADDING]);

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
      winnerFederal: winnersFederal[i].replace(/\s\((DEM|GOP)\)/, ''),
    }));
}
