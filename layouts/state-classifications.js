// d3 scales for classifying states based on polling
const d3 = require('d3');

const classification = d3.scaleThreshold()
    .range(['rep', 'leaningRep', 'swing', 'leaningDem', 'dem'])
    .domain([-10, -5, 5, 10]);

// for ME and NE classification
// if one CD (congressional district) is rep and another is leaningRep (or dem and leaningDem), do another round of classification to categorize 2 remaining votes as leaningRep or leaningDem
const meneClassification = d3.scaleThreshold()
    .range(['leaningRep', 'swing', 'leaningDem'])
    .domain([-5, 5]);

module.exports = {
  classification,
  meneClassification,
};
