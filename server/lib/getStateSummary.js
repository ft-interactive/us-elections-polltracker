/**
 * Gets state summary section
 */

import { marginThreshold } from './national-count';
import getStateCounts from './state-counts';

/**
 * This generates an object that contains which way the state is going.
 * @param  {string}  state State 2-letter abbreviation
 * @return {Promise}       [description]
 */
export default async function getStateSummary(state) {
  const stateCounts = await getStateCounts();
  const margin = stateCounts[state.code].margin;
  const marginClass = marginThreshold(margin);

  let text;

  switch (marginClass) {
    case 'rep':
      text = 'Strongly Republican';
      break;
    case 'leaningRep':
      text = 'Leaning Republican';
      break;
    case 'leaningDem':
      text = 'Leaning Democrat';
      break;
    case 'dem':
      text = 'Strongly Democrat';
      break;
    case 'swing':
    default:
      text = 'Toss-up state';
      break;
  }
  return {
    buttonText: text,
    marginClass,
  };
}

/**
 * When getting the class for the circles with a margin in a state with that margin,
 * check whether the index should be given an "ec-vote" class so it can be outlined.
 * This draws "dem/leaningDem" towards the right edge of their section, "swing" in the middle
 * of the swing votes, and "rep/leaningRep" towards the left edge of their group.
 * @param  {Number} idx        Index of current circle
 * @param  {Number} stateVotes Total number of state electoral college votes
 * @param  {String} margin     Margin class from getStateSummary()
 * @param  {Object} counts     Object containing the total EC vote estimate
 * @return {[type]}            [description]
 */
function getECClass(idx, stateVotes, margin, counts) {
  if (margin === 'dem') {
    return idx >= counts.dem - stateVotes ? 'ec-vote dem' : 'dem';
  } else if (margin === 'leaningDem') {
    return idx >= (counts.dem + counts.leaningDem) - stateVotes ? 'ec-vote leaningDem' : 'leaningDem';
  } else if (margin === 'swing') {
    return idx >= (counts.dem + counts.leaningDem + (counts.swing / 2)) - stateVotes / 2 &&
      idx <= (counts.dem + counts.leaningDem + (counts.swing / 2)) + stateVotes / 2
      ? 'ec-vote swing' : 'swing';
  } else if (margin === 'leaningRep') {
    return idx < (538 - (counts.rep + counts.leaningRep) + stateVotes)
      ? 'ec-vote leaningRep' : 'leaningRep';
  } else if (margin === 'rep') {
    return idx < (538 - counts.rep + stateVotes)
      ? 'ec-vote rep' : 'rep';
  }

  return margin; // fallback to whatever margin is.
}

/**
 * This returns a class for the circles, color coding them appropriately.
 * @param  {Number} idx        Index of current circle
 * @param  {Number} stateVotes Total number of state electoral college votes
 * @param  {Object} counts     Object containing the total EC vote estimate
 * @param  {Object} summary    Summary object from getStateSummary
 * @return {String|undefined}  Either one or two classes for the datum
 */
export function getVoteClass(idx, stateVotes, counts, summary) {
  const margin = summary.marginClass;
  if (idx < counts.dem) {
    return margin === 'dem' ? getECClass(idx, stateVotes, margin, counts) : 'dem';
  } else if (idx < (counts.dem + counts.leaningDem)) {
    return margin === 'leaningDem' ? getECClass(idx, stateVotes, margin, counts) : 'leaningDem';
  } else if (idx < (counts.dem + counts.leaningDem + counts.swing)) {
    return margin === 'swing' ? getECClass(idx, stateVotes, margin, counts) : 'swing';
  } else if (idx < (counts.dem + counts.leaningDem + counts.swing + counts.leaningRep)) {
    return margin === 'leaningRep' ? getECClass(idx, stateVotes, margin, counts) : 'leaningRep';
  } else if (idx < 538) { // Magic number here is total number of EC votes
    return margin === 'rep' ? getECClass(idx, stateVotes, margin, counts) : 'rep';
  }
  return undefined;
}
