import referenceData from '../../layouts/stateDemographics';

const labels = referenceData.label;

const national = referenceData.US;

const attributesToDisplay = [
  'wageGrowth2015',
  'unemployment',
  'poverty',
  'graduates',
  'hispanic',
  'africanAmerican',
];

const categories = attributesToDisplay.map(property => ({
  property,
  category: labels[property],
  nationalValue: national[property],
  stateValue: null,
  maxYVal: null,
}));

export function getStateDemographics(code) {
  return categories.map(category => {
    const data = referenceData[code.toUpperCase()];
    if (!data) return null;

    const stateValue = data[category.property];
    // Important: don't mutate the category, copy it instead.
    return {
      ...category,
      stateValue,
      maxYVal: Math.max(stateValue, category.nationalValue),
    };
  }).filter(Boolean);
}
