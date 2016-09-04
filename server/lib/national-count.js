import { scaleThreshold } from 'd3-scale';

export const marginThreshold = scaleThreshold()
.range(['rep', 'leaningRep', 'swing', 'leaningDem', 'dem'])
.domain([-10, -5, 5, 10]);

export const meneThreshold = scaleThreshold()
  .range(['leaningRep', 'swing', 'leaningDem'])
  .domain([-5, 5]);

export default async function nationalCount(stateData) {
  // for ME and NE classification
  // if one CD (congressional district) is rep and another is leaningRep (or dem and leaningDem), do another round of classification to categorize 2 remaining votes as leaningRep or leaningDem
  const stateCounts = Object.keys(stateData).reduce((cumulative, stateCode) => {
    const state = stateData[stateCode];

    // deal with Nebraska and Maine. TODO get rid of redundancies here
    if (stateCode === 'ME') {
      if (marginThreshold(stateData.ME.margin) === marginThreshold(stateData.MECD.margin)) {
        cumulative[marginThreshold(stateData.ME.margin)] += 2;
      } else {
        if (meneThreshold(stateData.ME.margin) === meneThreshold(stateData.MECD.margin)) {
          cumulative[meneThreshold(stateData.ME.margin)] += 2;
        } else {
          cumulative.swing += 2;
        }
      }
    }

    if (stateCode === 'NE') {
      if (marginThreshold(stateData.NE.margin) === marginThreshold(stateData.NECD.margin)
                    && marginThreshold(stateData.NECD.margin) === marginThreshold(stateData.NECD2.margin)) {
        cumulative[marginThreshold(stateData.NE.margin)] += 2;
      } else {
        if (meneThreshold(stateData.NE.margin) === meneThreshold(stateData.NECD.margin)
                    && meneThreshold(stateData.NECD.margin) === meneThreshold(stateData.NECD2.margin)) {
          cumulative[meneThreshold(stateData.NE.margin)] += 2;
        } else {
          cumulative.swing += 2;
        }
      }
    }

    cumulative[marginThreshold(state.margin)] += state.ecVotes;
    return cumulative;
  }, {
    dem: 0,
    leaningDem: 0,
    swing: 0,
    leaningRep: 0,
    rep: 0 });
  return stateCounts;
}
