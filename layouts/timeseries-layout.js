const d3 = require('d3');

const timeFormat = d3.timeFormat('%B %e, %Y');
const roundExtent = (ext, divisor) => [(ext[0] - ext[0] % divisor), (ext[1] + (divisor - ext[1] % divisor))];
const round1dp = (x) => Math.round(x * 10) / 10;

const candidates = ['Trump', 'Clinton'];
const candidateColor = {
  Trump: {
    line: '#e5262d',
    area: '#f4a098',
  },
  Clinton: {
    line: '#238fce',
    area: '#a2c1e1',
  },
};


function timeseriesLayout(data, opts) {
  const [svgWidth, svgHeight] = (opts.size || '600x300').split('x');
  const layout = {};
  const timeDomain = d3.extent(data, (d) => new Date(d.date));

  console.log(timeDomain);

  // derive start and end date from data
  Object.assign(layout, {
    fontless: (typeof opts.fontless === 'boolean' ? opts.fontless : (opts.fontless ? opts.fontless === 'true' : true)),
    notext: typeof opts.notext === 'boolean' ? opts.notext : false,
    background: opts.background || 'none',
    startDate: opts.startDate || new Date(timeDomain[0]),
    endDate: opts.endDate || new Date(timeDomain[1]),
    width: svgWidth,
    height: svgHeight,
    type: opts.type || 'area',
    state: opts.state || 'us',
    logo: (opts.logo ? opts.logo === 'true' : false),
    title: '!!!Which White House candidate is leading in the polls?',
    subtitle: 'National polling average as of August 2, 2016 (%)',
    source: 'Source: Real Clear Politics',
    yLabelOffset: '-7',
    margin: {
      top: 70,
      left: 35,
      right: 90,
      bottom: 70,
    },
  });

  // make the scales
  let rawExtent = d3.extent(data, (d) => d.pollaverage);
  let tickInterval = 5;
  if (rawExtent[1] - rawExtent[0] < 5) {
    tickInterval = 1;
  }
  rawExtent = [rawExtent[0] - 1, rawExtent[1] + 1];
  const extent = roundExtent(rawExtent, tickInterval);

  const yScale = d3.scaleLinear()
    .domain(extent)
    .range([layout.height - layout.margin.top - layout.margin.bottom, 0]);

  let tickCount = (extent[1] - extent[0]) / tickInterval;
  if (tickCount < 3) {
    tickCount = Math.round(extent[1] - extent[0]);
  }

  const xScale = d3.scaleTime()
    .domain(timeDomain)
    .range([0, layout.width - (layout.margin.left + layout.margin.right)]);


  layout.xTicks = xScale.ticks(5).map((d) => ({
    label: timeFormat(d),
    position: xScale(d),
  }));

  // make the path generators etc.
  const path = d3.line()
      .x(d => round1dp(xScale(d.date)))
      .y(d => round1dp(yScale(d.pollaverage)));

  layout.yTicks = yScale.ticks(tickCount).map(d => ({
    label: d,
    position: yScale(d),
  }));

  layout.candidateAreas = [];

  const pollsByCandidate = candidates.map((d) => ({
    name: d,
    polls: data.filter((row) => (row.candidatename === d)),
  }));

  const currentLeader = pollsByCandidate.reduce(function (previous, current) {
    const currentValue = current.polls[current.polls.length - 1].pollaverage;
    if (previous.value < currentValue) {
      return {
        name: current.name,
        value: currentValue,
      };
    }
  }, { name: 'Trump', value: 0 }).name;

  layout.candidateLines = pollsByCandidate.map((d) => ({
    stroke: candidateColor[d.name].line,
    d: path(d.polls),
  }));

  layout.candidateEndPoints = pollsByCandidate.map(function (d) {
    const lastPoll = d.polls[d.polls.length - 1];
    let labelOffset = 10;
    if (d.name === currentLeader) labelOffset = 0;

    return {
      cx: round1dp(xScale(lastPoll.date)),
      cy: round1dp(yScale(lastPoll.pollaverage)),
      fill: candidateColor[d.name].line,
      stroke: candidateColor[d.name].area,
      labelValue: d3.format('.1f')(lastPoll.pollaverage),
      labelName: d.name,
      labelOffset,
    };
  });

  return layout;
}

module.exports = timeseriesLayout;
