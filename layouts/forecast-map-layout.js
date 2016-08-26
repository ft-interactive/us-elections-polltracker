// provides a dictionary of state colours based on defined thresholds for how safe a bet a given state is for a given candidate

const d3 = require('d3');
const color = require('./color.js');

const classification = d3.scaleThreshold()
  .range(['rep', 'leaningRep', 'swing', 'leaningDem', 'dem'])
  .domain([-10, -5, 5, 10]); // margins


function forecastMapLayout(stateData, opts) {
    const [svgWidth, svgHeight] = (opts.size || '900x580').split(/\D/); // split on non digit characters
    const layoutObject = {
      background: opts.background || null, 
      color,
      fontless: (typeof opts.fontless === 'boolean' ? opts.fontless : (opts.fontless ? opts.fontless === 'true' : true)),
      key: (opts.key ? opts.key === 'true' : false),
      logo: (opts.logo ? opts.logo === 'true' : false),
      width: svgWidth,
      height: svgHeight,
    };

    Object.keys(stateData).forEach(function (d) {
      const currentState = stateData[d];
      const stateClassification = classification(currentState.margin);
      layoutObject[d] = {
          classification: stateClassification,
          fill: color[stateClassification],
          stroke: color[stateClassification],
          data: currentState,
    };
	});
  // console.log( 'logo', layoutObject.logo );

  return layoutObject;
}

module.exports = forecastMapLayout;

/* example state Object

  WI:
   { classification: 'leaningDem',
     fill: '#a00',
     stroke: '#a00',
     data:
      { Clinton: 46.7,
        Trump: 37.3,
        margin: 9.400000000000006,
        ecVotes: 10 } },

 */
