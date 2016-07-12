const _ = require('underscore');
const drawMarginsChart = require('./drawMarginsChart');
const drawPollAvgChart = require('./drawPollAvgChart');

function round_1dp(x) {
  return Math.round(x * 10) / 10;
}

async function drawChartWrapper(width, height, fontless, background, startDate, endDate, type, data) {

  let svgContent;
  switch (type) {
    case 'pollAvg':
      data = _.groupBy(data, (row) => row.candidatename);
      svgContent = await drawPollAvgChart(width, height, startDate, endDate, type, data);
      break;
    case 'margins':
      data = _.groupBy(data, (row) => row.date);
      svgContent = await drawMarginsChart(width, height, 0, startDate, endDate, type, data);
      break;
    default: // case both
      const pollAvgData = _.groupBy(data, (row) => row.candidatename);
      const marginsData = _.groupBy(data, (row) => row.date);
      const pollAvgSVGContent = await drawPollAvgChart(width, 0.75 * height, startDate, endDate, type, pollAvgData);
      const marginsSVGContent = await drawMarginsChart(width, 0.55 * height, 0.43 * height, startDate, endDate, type, marginsData);

      svgContent = pollAvgSVGContent + marginsSVGContent;
      break;
  }

  const chartLayout = {
    width: width,
    height: height,
    background: background,
    fontless: fontless,
    svgContent: svgContent,
  };

  return chartLayout;
}

module.exports = drawChartWrapper;
