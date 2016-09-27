// d3 scales for classifying states based on polling
const d3 = require('d3');


module.exports = {
  forecast: d3.scaleThreshold()
    .range(['rep', 'leaningRep', 'swing', 'leaningDem', 'dem'])
    .domain([-10.01, -5.01, 5.01, 10.01]),
};
