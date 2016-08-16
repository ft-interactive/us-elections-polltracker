// d3 scales for classifying states based on polling
const d3 = require('d3');


module.exports = {
  forecast: d3.scaleThreshold()
    .range(['rep', 'leaningRep', 'swing', 'leaningDem', 'dem'])
    .domain([-10, -5, 5, 10]),
  forecastMENE: d3.scaleThreshold()
    .range(['leaningRep', 'swing', 'leaningDem'])
    .domain([-5, 5]),
};
