// provides a dictionary of state colours based on defined thresholds for how safe a bet a given state is for a given candidate

import color from './color';

import { marginThreshold } from '../server/lib/national-count';

export default (stateData, opts) => {
  const [svgWidth, svgHeight] = (opts.size || '900x580').split(/\D/); // split on non digit characters

  const layoutObject = {
    background: opts.background || null,
    color,
    fontless: (opts.fontless === 'true' ? true : opts.fontless),
    key: (opts.key ? opts.key === 'true' : false),
    logo: (opts.logo ? opts.logo === 'true' : false),
    width: svgWidth,
    height: svgHeight,
  };

  Object.keys(stateData).forEach(d => {
    const currentState = stateData[d];
    const stateClassification = Number.isFinite(currentState.margin) ? marginThreshold(currentState.margin) : 'nodata';
    layoutObject[d] = {
      classification: stateClassification,
      fill: color[stateClassification],
      stroke: color[stateClassification],
      data: currentState,
    };
  });

  return layoutObject;
};

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
