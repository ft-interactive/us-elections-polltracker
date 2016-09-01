import { scaleThreshold } from 'd3-scale';

export default async function nationalCount(stateData) {
  const classification = scaleThreshold()
      .range(['rep', 'leaningRep', 'swing', 'leaningDem', 'dem'])
      .domain([-10, -5, 5, 10]);

  // for ME and NE classification
  // if one CD (congressional district) is rep and another is leaningRep (or dem and leaningDem), do another round of classification to categorize 2 remaining votes as leaningRep or leaningDem
  const meneClassification = scaleThreshold()
    .range(['leaningRep', 'swing', 'leaningDem'])
    .domain([-5, 5]);

  const stateCounts = Object.keys(stateData).reduce((cumulative, stateCode) => {
    const state = stateData[stateCode];

    // deal with Nebraska and Maine. TODO get rid of redundancies here
    if (stateCode === 'ME') {
      if (classification(stateData.ME.margin) === classification(stateData.MECD.margin)) {
        cumulative[classification(stateData.ME.margin)] += 2;
        // console.log(stateCode, 'added 2 to ', classification(state.margin));
      } else {
        if (meneClassification(stateData.ME.margin) === meneClassification(stateData.MECD.margin)) {
          cumulative[meneClassification(stateData.ME.margin)] += 2;
          // console.log(stateCode, 'added 2 to ', meneClassification(stateData.ME.margin));
        } else {
          cumulative.swing += 2;
          // console.log(stateCode, 'added 2 to swing else');
        }
      }
    }

    if (stateCode === 'NE') {
      if (classification(stateData.NE.margin) === classification(stateData.NECD.margin) && classification(stateData.NECD.margin) === classification(stateData.NECD2.margin)) {
        cumulative[classification(stateData.NE.margin)] += 2;
        // console.log(stateCode, 'added 2 to ', classification(stateData.NE.margin));
      } else {
        if (meneClassification(stateData.NE.margin) === meneClassification(stateData.NECD.margin) && meneClassification(stateData.NECD.margin) === meneClassification(stateData.NECD2.margin)) {
          cumulative[meneClassification(stateData.NE.margin)] += 2;
          // console.log(stateCode, 'added 2 to ', meneClassification(stateData.NE.margin));
        } else {
          cumulative.swing += 2;
          // console.log(stateCode, 'added 2 to swing else');
        }
      }
    }

    cumulative[classification(state.margin)] += state.ecVotes;
    return cumulative;
  }, {
    dem: 0,
    leaningDem: 0,
    swing: 0,
    leaningRep: 0,
    rep: 0 });
  return stateCounts;
}
