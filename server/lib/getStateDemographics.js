import { extent } from 'd3-array';
import _ from 'lodash';
import referenceData from '../../layouts/stateDemographics';

const labels = referenceData.label;

const national = referenceData.US;

const states = _.omit(referenceData, ['label', 'US']);

const attributesToDisplay = [
  'wageGrowth2015',
  'unemployment',
  'poverty',
  'graduates',
  'hispanic',
  'africanAmerican',
];

const categories = attributesToDisplay.map(property => {
  const allStates = _.map(states, d => ({
    stateName: d.stateName,
    value: d[property],
  })).filter(d => Number.isFinite(d.value));

  const domain = extent(allStates, d => d.value);
  return {
    property,
    allStates,
    domain,
    label: labels[property],
    stateValue: null,
    maxYVal: null,
    nationalAvg: national[property],
  };
});

export default code => {
  let cleanCode = code.toUpperCase();
  // deal with Maine, Nebraska
  if (cleanCode.indexOf('CD') !== -1) {
    cleanCode = cleanCode.split('CD')[0];
  }

  return categories.map(category => {
    const data = referenceData[cleanCode];
    if (!data) return null;

    const stateValue = data[category.property];
    // console.log(category.allStates);
    // Important: don't mutate the category, copy it instead.
    return {
      ...category,
      stateValue,
      maxYVal: Math.max(stateValue, category.nationalValue),
    };
  }).filter(Boolean);
};
