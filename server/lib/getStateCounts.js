import _ from 'underscore';
import getAllLatestStateAverages from '../../layouts/getAllLatestStateAverages';
import stateIds from '../../data/states';

export default async overrideData => {
  const latestStateAverages = await getAllLatestStateAverages();
  const groupedStateCounts = _.groupBy(latestStateAverages, 'state');
  const overrideCategories = overrideData.overrideCategories;
  const stateCounts = {};

  for (let i = 0; i < stateIds.length; i++) {
    const stateKey = stateIds[i].code;
    let clintonAvg = null;
    let trumpAvg = null;
    let margin = null;

    if (stateKey !== 'US') {
      if (stateKey.toLowerCase() in groupedStateCounts) {
        const statePollAverages = groupedStateCounts[stateKey.toLowerCase()];
        clintonAvg = _.findWhere(statePollAverages, { candidatename: 'Clinton' }).pollaverage || null;
        trumpAvg = _.findWhere(statePollAverages, { candidatename: 'Trump' }).pollaverage || null;
        if (clintonAvg && trumpAvg) {
          margin = clintonAvg - trumpAvg;
        }
      }

      stateCounts[stateKey] = {
        Clinton: clintonAvg,
        Trump: trumpAvg,
        margin: margin || _.findWhere(overrideCategories, { state: stateKey.toUpperCase() }).overridevalue,
        ecVotes: _.findWhere(stateIds, { code: stateKey.toUpperCase() }).ecVotes,
      };
    }
  }

  return stateCounts;
};
