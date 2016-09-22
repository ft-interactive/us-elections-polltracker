import _ from 'lodash';
import getAllLatestStateAverages from '../../layouts/getAllLatestStateAverages';
import stateIds from '../../data/states';

export default async overrideData => {
  const latestStateAverages = await getAllLatestStateAverages();
  const groupedStateCounts = _.groupBy(latestStateAverages, 'state');
  const overrideCategories = overrideData.overrideCategories;
  const stateCounts = {};

  for (let i = 0; i < stateIds.length; i += 1) {
    const stateKey = stateIds[i].code;
    let clintonAvg = null;
    let trumpAvg = null;
    let margin = null;

    if (stateKey !== 'US') {
      if (stateKey.toLowerCase() in groupedStateCounts) {
        const statePollAverages = groupedStateCounts[stateKey.toLowerCase()];
        clintonAvg = _.find(statePollAverages, _.iteratee({ candidatename: 'Clinton' })).pollaverage || null;
        trumpAvg = _.find(statePollAverages, _.iteratee({ candidatename: 'Trump' })).pollaverage || null;
        if (clintonAvg && trumpAvg) {
          margin = clintonAvg - trumpAvg;
        }
      }

      stateCounts[stateKey] = {
        Clinton: clintonAvg,
        Trump: trumpAvg,
        margin: margin || _.find(overrideCategories, _.iteratee({ state: stateKey.toUpperCase() })).overridevalue,
        ecVotes: _.find(stateIds, _.iteratee({ code: stateKey.toUpperCase() })).ecVotes,
      };
    }
  }

  return stateCounts;
};
