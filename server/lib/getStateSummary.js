/**
 * Gets state summary page
 */

import getStateCounts from './state-counts';
import { marginThreshold } from './national-count';

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
      text = 'Toss-up';
      break;
  }
  return {
    buttonText: text,
    marginClass,
  };
}
