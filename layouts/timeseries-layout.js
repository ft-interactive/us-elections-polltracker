const d3 = require('d3');
const timeFormat = d3.timeFormat('%B %e, %Y');


function timeseriesLayout(data, opts) {
  const [svgWidth, svgHeight] = (opts.size || '600x300').split('x');
  const layout = {};
  Object.assign(layout, {
    fontless: (typeof opts.fontless === 'boolean' ? opts.fontless : (opts.fontless ? opts.fontless === 'true' : true)),
    notext: typeof opts.notext === 'boolean' ? opts.notext : false,
    background: opts.background || 'none',
    startDate: opts.startDate || 'June 1, 2016',
    endDate: opts.endDate || timeFormat(new Date()),
    width: svgWidth,
    height: svgHeight,
    type: opts.type || 'area',
    state: opts.state || 'us',
    logo: (opts.logo ? opts.logo === 'true' : false),
    title: '!Which White House candidate is leading in the polls?',
    subtitle: '!National polling average as of August 2, 2016 (%)',
    source: '!Source: Real Clear Politics',
    yLabelOffset: '-7',
    margin: {
      top: 70,
      left: 35,
      right: 90,
      bottom: 70,
    },
  });

  console.log(layout);

  return layout;
  
  var a = {
    yTicks: [{label:'', position:''}],
    xTicks: [{label:'', position:''}],
    candidateAreas: [],
    candidateLines: [],
    candidateEndPoints: [],
    title: '!Which White House candidate is leading in the polls?',
    subtitle: '!National polling average as of August 2, 2016 (%)',
    source: '!Source: Real Clear Politics',
  };
}

module.exports = timeseriesLayout;
