/**
 * Gets state summary section
 */

import { scaleThreshold } from 'd3-scale';

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
    stateCounts,
  };
}

export function getVoteClass(stateCode, stateCounts) {
  return marginThreshold(stateCounts[stateCode].margin);
}

export async function getECVoteScales() {
  const stateCounts = await getStateCounts();
  const stateData = Object.entries(stateCounts).map(([, data]) => ({
    data,
    margin: data.margin,
    ecVotes: data.ecVotes,
  }))
    .sort((a, b) => b.margin - a.margin)
    .reduce((last, curr) => {
      const currentTotal = last.length ? (last[last.length - 1].idxMax + curr.ecVotes) : curr.ecVotes;
      last.push({
        code: curr.data.code,
        fullname: curr.data.fullname,
        idxMax: currentTotal,
      });

      return last;
    }, []);

  const scaleECVotesByCode = scaleThreshold()
    .range(stateData.map(d => d.code))
    .domain(stateData.map(d => d.idxMax));

  const scaleECVotesByFullname = scaleThreshold()
    .range(stateData.map(d => d.fullname))
    .domain(stateData.map(d => d.idxMax));

  return idx => ({
    code: scaleECVotesByCode(idx),
    fullname: scaleECVotesByFullname(idx),
  });
}
