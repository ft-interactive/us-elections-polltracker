const d3 = require('d3');
const svgIntersections = require('svg-intersections');
const intersect = svgIntersections.intersect;
const shape = svgIntersections.shape;

// little utility functions
const timeFormat = d3.timeFormat('%b %e, %Y');
const timeFormatShort = d3.timeFormat('%b %e');
const timeFormatMonth = d3.timeFormat('%b');
const roundExtent = (ext, divisor) => [(ext[0] - ext[0] % divisor), (ext[1] + (divisor - ext[1] % divisor))];
const round1dp = (x) => Math.round(x * 10) / 10;

// configuration
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

function mergePolls(a, b, xScale, yScale) {
  return a.polls.map(function (d, i) {
    const mergedRow = {};
    if (b.polls[i].date.getTime() !== d.date.getTime()) {
      console.log('ERROR: non matching arrays can\'t be merged ', d, b.polls[i]);
      return false;
    }
    let leader = b.name;
    if (d.pollaverage > b.polls[i].pollaverage) {
      leader = a.name;
    }
    mergedRow.date = d.date;
    mergedRow[a.name] = d.pollaverage;
    mergedRow[b.name] = b.polls[i].pollaverage;
    mergedRow.x = xScale(d.date);
    mergedRow[a.name + '_y'] = yScale(mergedRow[a.name]);
    mergedRow[b.name + '_y'] = yScale(mergedRow[b.name]);
    mergedRow.lead = leader;
    return mergedRow;
  });
}

// the actual layout function
function timeseriesLayout(data, opts) {
  if (!data) return;
  const [svgWidth, svgHeight] = (opts.size || '600x300').split('x');
  const layout = {};
  const timeDomain = d3.extent(data, (d) => new Date(d.date));

  // set the default options if they're not specified in 'opts'
  Object.assign(layout, {
    fontless: (typeof opts.fontless === 'boolean' ? opts.fontless : (opts.fontless ? opts.fontless === 'true' : true)),
    notext: typeof opts.notext === 'boolean' ? opts.notext : false,
    background: opts.background || null,
    startDate: new Date(timeDomain[0]),
    endDate: opts.endDate || new Date(timeDomain[1]),
    width: svgWidth,
    height: svgHeight,
    type: opts.type || 'area',
    state: opts.state || 'us',
    logo: (opts.logo ? opts.logo === 'true' : false),
    title: 'Which White House candidate is leading in the polls?',
    subtitle: 'Polling average (%)',
    source: 'Source: Real Clear Politics',
    yLabelOffset: '-7',
    margin: opts.margin ? opts.margin : {
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

  // set axis ticks
  layout.xTicks = [];

  // add domain extent ticks
  xScale.domain().forEach(function (d, i) {
    layout.xTicks.push({
      date: d,
      label: function (date, index) {
        if (index > 0) return timeFormatShort(date);
        return timeFormat(date);
      }(d, i),
      position: xScale(d),
      important: true,  // extent ticks should always be labeled
      textanchor: (i === 1) ? 'end' : 'start',
    });
  });

  // add month ticks
  const currentDate = xScale.domain()[0];
  do {
    currentDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth() + 1);
    layout.xTicks.push({
      date: currentDate,
      label: timeFormatMonth(currentDate),
      position: xScale(currentDate),
      important: false,
      textanchor: 'middle',
    });
  } while (currentDate.getTime() < xScale.domain()[0].getTime());

  // if a year boundaries are crossed add year ticks
  if (xScale.domain()[0].getFullYear() !== xScale.domain()[1].getFullYear()) {
    let currentYear = xScale.domain()[0].getFullYear();
    do {
      currentYear ++;
      const currentDate = new Date(currentYear, 0, 1);
      layout.xTicks.push({
        date: currentDate,
        label: currentYear,
        position: xScale(currentDate),
        important: true,  // years should always be labeled
        textanchor: 'middle',
      });
    } while (currentYear < xScale.domain()[1].getFullYear());
  }

  layout.yTicks = yScale.ticks(tickCount).map(d => ({
    label: d,
    position: yScale(d),
  }));

  // make the path generators etc.
  const path = d3.line()
      .x(d => round1dp(xScale(d.date)))
      .y(d => round1dp(yScale(d.pollaverage)));


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

  const intersections = intersect(
    shape('path', { d: layout.candidateLines[0].d }),
    shape('path', { d: layout.candidateLines[1].d })
  );

  const areas = mergePolls(pollsByCandidate[0], pollsByCandidate[1], xScale, yScale)
    .reduce(function (sections, current) {
      // if there are no sections make the first
      if (sections.length === 0) {
        sections.push([current]);
        return sections;
      }
      // otherwise, get the leader in last poll in the last available section
      const currentSection = sections[sections.length - 1];
      const previousLead = currentSection[currentSection.length - 1].lead;
      // if it's a different leader from the poll currently being considered then make a new array and push it that as a new section
      if (previousLead !== current.lead) {
        sections.push([current]);
      } else {
        currentSection.push(current);
      }
      // insert the current poll into the last array in the array of sections
      return sections;
    }, []);

  const areaPath = d3.area()
    .x(d => round1dp(d.x))
    .y0(d => round1dp(d[candidates[0] + '_y']))
    .y1(d => round1dp(d[candidates[1] + '_y']));


// produce the array of areas

  layout.candidateAreas = areas.map(function (d, i, a) {
    const leader = d[0].lead;
    const section = d;
    const startIntersection = intersections.points[i - 1];
    const endIntersection = intersections.points[i];
    if (startIntersection) {
      section.unshift({
        x: startIntersection.x,
        [candidates[0] + '_y']: startIntersection.y,
        [candidates[1] + '_y']: startIntersection.y,
      });
    }
    if (endIntersection) {
      section.push({
        x: endIntersection.x,
        [candidates[0] + '_y']: endIntersection.y,
        [candidates[1] + '_y']: endIntersection.y,
      });
    }

    return {
      d: areaPath(section),
      fill: candidateColor[leader].area,
    };
  });

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
