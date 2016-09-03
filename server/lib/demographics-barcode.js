import _ from 'underscore';
import { render } from '../nunjucks';
import referenceData from '../../layouts/stateDemographics';

const d3 = require('d3');
const stateByID = require('../../layouts/stateIds').byID;

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

export function formatToPercent(n) {
  return Math.round(n * 1000) / 10;
}

// return svg object given indicator
function layoutDemographicBarcode(code, indicator) {
  // deal with Maine, Nebraska
  if (code.toUpperCase().indexOf('CD') > -1) {
    code = code.split('CD')[0];
  }

  const stateData = referenceData[code.toUpperCase()][indicator];
  if (!stateData) return null;

  const indicatorData = _.pluck(_.omit(referenceData, ['label', 'US']), indicator); // list of indicator data from all states (minus label and national)
  const nationalData = national[indicator];

  const chartConfig = {
    width: 210,
    height: 160,
    margin: {
      left: 25,
      right: 25,
      top: 40,
      bottom: 60,
    },
  };

  const xDomain = d3.extent(indicatorData);

  const xScale = d3.scaleLinear()
    .domain(xDomain)
    .range([0, chartConfig.width - (chartConfig.margin.left + chartConfig.margin.right)]);

  const stateTicks = indicatorData.map(val => xScale(val));

  const stateName = stateByID[code.toUpperCase()].stateName;

  let stateLabelTextDirection = 'start';
  if (xScale(stateData) / xScale(xDomain[1]) > 0.5) {
    stateLabelTextDirection = 'end';
  }

  return {
    stateName,
    ...chartConfig,
    stateTicks,
    highlight: {
      value: `${formatToPercent(stateData)}%`,
      position: xScale(stateData),
      textDirection: stateLabelTextDirection,
    },
    xTicks: [{
      label: 'min',
      value: `${formatToPercent(d3.min(indicatorData))}%`,
      position: xScale(d3.min(indicatorData)),
    },
    {
      label: 'US avg',
      value: `${formatToPercent(d3.mean(indicatorData))}%`,
      position: xScale(d3.mean(indicatorData)),
    },
    {
      label: 'max',
      value: `${formatToPercent(d3.max(indicatorData))}%`,
      position: xScale(d3.max(indicatorData)),
    }],
  };
}

export function getDemographicsSVGs(code) {
  return attributesToDisplay.map(indicator => {
    return {
      label: labels[indicator],
      svg: render('demographics-barcode.svg', layoutDemographicBarcode(code, indicator)),
    };
  });
}
