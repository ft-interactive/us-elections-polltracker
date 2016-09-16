
const color = require('./color.js');
const d3 = require('d3');
const svgIntersections = require('svg-intersections');
const intersect = svgIntersections.intersect;
const shape = svgIntersections.shape;

import { codeToName } from '../server/lib/states';

// little utility functions
const timeFormat = d3.timeFormat('%b %e, %Y');
const timeFormatLong = d3.timeFormat('%B %e, %Y');
const timeFormatShort = d3.timeFormat('%b %e');
const timeFormatMonth = d3.timeFormat('%b');
const roundExtent = (ext, divisor) => [(ext[0] - ext[0] % divisor), (ext[1] + (divisor - ext[1] % divisor))];
const round1dp = (x) => Math.round(x * 10) / 10;

// configuration
const candidateList = ['Trump', 'Clinton', 'Johnson', 'Stein'];
const candidateColor = {
  Trump: {
    line: color.Trump,
    area: color.Trump,
  },
  Clinton: {
    line: color.Clinton,
    area: color.Clinton,
  },
  Johnson: {
    line: color.Johnson,
    area: color.Johnson,
  },
  Stein: {
    line: color.Stein,
    area: color.Stein,
  },
};

function mergePolls(a, b, xScale, yScale) {
  return a.polls.map(function (d, i) {
    const mergedRow = {};
    if (b.polls[i].date.getTime() !== d.date.getTime()) {
      return false;
    }
    let leader = b.name;
    if (d.pollaverage > b.polls[i].pollaverage) {
      leader = a.name;
    }
    if (d.pollaverage === b.polls[i].pollaverage) {
      leader = 'tie';
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

function getTitle(state, width) {
  if (width < 450 && (state === 'us' || !state)) return 'Latest polls';
  if (state && state !== 'us') {
    const stateName = codeToName(state.toUpperCase());
    if (width < 450) return 'Latest polls: ' + stateName;
    return 'Which candidate is leading in ' + stateName + '?';
  }
  return 'Which White House candidate is leading in the polls?';
}

function getSubtitle(date, width, state){
  if(width<350){
    console.log('state', state);
      if(state && state !== 'us')   return 'State polling average to ' + timeFormat(date) + ' (%)';
      return 'National polling average to ' + timeFormat(date) + ' (%)';
  }
  if(state && state !== 'us')   return 'State polling average as of ' + timeFormatLong(date) + ' (%)';
  return 'National polling average as of ' + timeFormatLong(date) + ' (%)';
}

// the actual layout function
function timeseriesLayout(data, opts) {
  if (!data || data.length < 1) return;

  if (!opts.pollnumcandidates) {
    opts.pollnumcandidates = 4;
  }
  opts.pollnumcandidates = 2; // override change this later

  const candidates = candidateList.slice(0, opts.pollnumcandidates);

  const [svgWidth, svgHeight] = (opts.size || '600x300').split(/\D/); // split on non digit characters
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
    title: getTitle(opts.state, svgWidth),
    subtitle: getSubtitle(timeDomain[1], svgWidth, opts.state),
    source: 'Source: Real Clear Politics',
    yLabelOffset: '-7',
    margin: opts.margin ? opts.margin : {
      top: 70,
      left: 35,
      right: 90,
      bottom: 70,
    },
    color,
    pollnumcandidates: opts.pollnumcandidates,
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
      extent: true, // the ticks at the end of the axis may be posiotined differently
      important: true,  // extent ticks should always be labeled
      textanchor: (i === 1) ? 'end' : 'start',
    });
  });

  // add month ticks
  const currentDate = xScale.domain()[0];
  currentDate.setMonth(currentDate.getMonth() + 1);
  const monthSpacing = xScale(new Date(2016, 1, 1)) - xScale(new Date(2016, 0, 1));
  const tickBuffer = [5, 35];

  do {
    if (currentDate.getMonth() !== 0) { // dona't add a tick for jan as that'll be given a new year tick
      layout.xTicks.push({
        date: currentDate,
        label: timeFormatMonth(currentDate),
        position: xScale(currentDate),
        important: function (d) { // make this true under certain circumstances i.e. if there are few enough ticks and the tick in question is distant enough from the end of the axis
          return (
            monthSpacing > 50
            && (xScale(currentDate) < xScale.range()[1] - tickBuffer[1])
            && (xScale(currentDate) > xScale.range()[0] + tickBuffer[0])
          );
        }(currentDate),
        textanchor: 'start',
      });
    }
    currentDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth() + 1);
  } while (currentDate.getTime() < xScale.domain()[1].getTime());

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
        textanchor: 'start',
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

  let currentLeader = '';
  if (pollsByCandidate[0].polls[pollsByCandidate[0].polls.length - 1].pollaverage
    > pollsByCandidate[1].polls[pollsByCandidate[1].polls.length - 1].pollaverage) {
    currentLeader = pollsByCandidate[0].name;
  } else {
    currentLeader = pollsByCandidate[1].name;
  }

  layout.candidateLines = pollsByCandidate.map((d) => ({
    stroke: candidateColor[d.name].line,
    d: path(d.polls),
  }));

  const intersections = intersect(
    shape('path', { d: layout.candidateLines[0].d }),
    shape('path', { d: layout.candidateLines[1].d })
  );

// produce the array of areas
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

    let fillColor = 'none';
    if (leader !== 'tie') {
      fillColor = candidateColor[leader].area;
    }

    return {
      d: areaPath(section),
      fill: fillColor,
    };
  });

  layout.candidateEndPoints = pollsByCandidate.map(function (d) {
    const lastPoll = d.polls[d.polls.length - 1];
    let labelOffset = 10;
    if (d.name === currentLeader || d.name === 'Johnson') labelOffset = 0;

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

  // pass in # of data points
  layout.numPoints = data.length / candidates.length;

  return layout;
}

module.exports = timeseriesLayout;
