import _ from 'lodash';
import * as d3 from 'd3';
import { intersect, shape } from 'svg-intersections';
import color from './color';
import { getByCode } from '../server/lib/states';

// little utility functions
const timeFormat = d3.timeFormat('%b %e, %Y');
const timeFormatShort = d3.timeFormat('%b %e');
const timeFormatMonth = d3.timeFormat('%b');

const roundExtent = (ext, divisor) => [
  (ext[0] - (ext[0] % divisor)),
  (ext[1] + (divisor - (ext[1] % divisor))),
];

const round1dp = x => Math.round(x * 10) / 10;

// configuration
const candidateList = ['Trump', 'Clinton', 'McMullin', 'Johnson', 'Stein'];
const candidateColor = {
  Trump: {
    line: color.Trump,
    area: color.Trump,
  },
  Clinton: {
    line: color.Clinton,
    area: color.Clinton,
  },
  McMullin: {
    line: color.McMullin,
    area: color.McMullin,
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
  return a.polls.map((d, i) => {
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
    mergedRow[`${a.name}_y`] = yScale(mergedRow[a.name]);
    mergedRow[`${b.name}_y`] = yScale(mergedRow[b.name]);
    mergedRow.lead = leader;

    return mergedRow;
  });
}

function getTitle(state, width) {
  if (width < 450 && (state === 'us' || !state)) return 'Latest polls';
  if (state && state !== 'us') {
    const stateName = getByCode(state.toUpperCase()).name;

    if (width < 450) return `Latest polls: ${stateName}`;
    return `Which candidate is leading in ${stateName}?`;
  }

  return 'Which White House candidate is leading in the polls?';
}

function getSubtitle(date, width, state) {
  if (width < 350) {

    if (state && state !== 'us') {
      return `State polling average to ${timeFormat(date)} (%)`;
    }

    return `National polling average to ${timeFormat(date)} (%)`;
  }

  if (state && state !== 'us') {
    return `State polling average as of ${timeFormat(date)} (%)`;
  }

  return `National polling average as of ${timeFormat(date)} (%)`;
}

// the actual layout function
function timeseriesLayout(data, _opts) {
  if (!data || data.length < 1) return undefined;

  const opts = { ..._opts };
  opts.pollnumcandidates = 2; // always only display Clinton/Trump lines, except in Utah where you also display McMullin
  if (opts.state === 'ut') {
    opts.pollnumcandidates = 3;
    opts.type = 'line'; // utah should be by default a line
  }

  const candidates = candidateList.slice(0, opts.pollnumcandidates);

  const [svgWidth, svgHeight] = (opts.size || '600x300').split(/\D/); // split on non digit characters
  const layout = {};
  const timeDomain = d3.extent(data, d => new Date(d.date));

  // set the default options if they're not specified in 'opts'
  Object.assign(layout, {
    fontless: (opts.fontless === 'true' ? true : opts.fontless),
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
      right: 150,
      bottom: 70,
    },
    color,
    pollnumcandidates: opts.pollnumcandidates,
    outlineColor: opts.outlineColor || 'ffffff',
  });

  // make the scales
  let rawExtent = d3.extent(data, d => {
    if (d.candidatename === 'Clinton' || d.candidatename === 'Trump' || d.candidatename === 'McMullin') {
      return d.pollaverage;
    }
    return null;
  });

  let tickInterval = 5;
  let extent;

  if (opts.yAxisDomain) {
    extent = [Number(opts.yAxisDomain.split('-')[0]), Number(opts.yAxisDomain.split('-')[1])];
  } else {
    if (rawExtent[1] - rawExtent[0] < 5) {
      tickInterval = 1;
    }
    rawExtent = [rawExtent[0] - 1, rawExtent[1] + 1];
    extent = roundExtent(rawExtent, tickInterval);
  }

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
  xScale.domain().forEach((d, i) => {
    layout.xTicks.push({
      date: d,
      label: ((date, index) =>
        (index > 0 ? timeFormatShort(date) : timeFormat(date))
      )(d, i),
      position: xScale(d),
      extent: true, // the ticks at the end of the axis may be posiotined differently
      important: true,  // extent ticks should always be labeled
      textanchor: (i === 1) ? 'end' : 'start',
    });
  });

  // add month ticks
  {
    const currentDate = xScale.domain()[0];
    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setDate(1);
    const monthSpacing = xScale(new Date(2016, 1, 1)) - xScale(new Date(2016, 0, 1));
    const tickBuffer = [5, 35];

    if (currentDate.getTime() <= xScale.domain()[1].getTime()) { // don't add more ticks if new month tick is greater than end date
      do {
        if (currentDate.getMonth() !== 0) { // dona't add a tick for jan as that'll be given a new year tick
          layout.xTicks.push({
            date: currentDate,
            label: timeFormatMonth(currentDate),
            position: xScale(currentDate),
            important: (() =>
              // make this true under certain circumstances i.e. if there are few enough ticks and the tick in question is distant enough from the end of the axis
              monthSpacing > 50
              && (xScale(currentDate) < xScale.range()[1] - tickBuffer[1])
              && (xScale(currentDate) > xScale.range()[0] + tickBuffer[0])
            )(currentDate),
            textanchor: 'start',
          });
        }
        currentDate.setDate(1);
        currentDate.setMonth(currentDate.getMonth() + 1);
      } while (currentDate.getTime() < xScale.domain()[1].getTime());
    }
  }

  // if a year boundaries are crossed add year ticks
  if (xScale.domain()[0].getFullYear() !== xScale.domain()[1].getFullYear()) {
    let currentYear = xScale.domain()[0].getFullYear();
    do {
      currentYear += 1;
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

  // thin out the ticks if there is more than one every 13px
  if (yScale.range()[0] / layout.yTicks.length < 13) {
    layout.yTicks = layout.yTicks.filter((d, i) => (i % 2 === 0)); // only include the even indexed ticks (these can represent even or odd values...)
  }

  // make the path generators etc.
  const path = d3.line()
      .x(d => round1dp(xScale(d.date)))
      .y(d => round1dp(yScale(d.pollaverage)));

  const pollsByCandidate = candidates.map(d => ({
    name: d,
    polls: data.filter(row => (row.candidatename === d)),
  }));

  let currentLeader = '';
  if (pollsByCandidate[0].polls[pollsByCandidate[0].polls.length - 1].pollaverage
    > pollsByCandidate[1].polls[pollsByCandidate[1].polls.length - 1].pollaverage) {
    currentLeader = pollsByCandidate[0].name;
  } else {
    currentLeader = pollsByCandidate[1].name;
  }

  layout.candidateLines = pollsByCandidate.map(d => ({
    stroke: candidateColor[d.name].line,
    d: path(d.polls),
  }));

  const intersections = intersect(
    shape('path', { d: layout.candidateLines[0].d }),
    shape('path', { d: layout.candidateLines[1].d })
  );

  const formattedData = mergePolls(pollsByCandidate[0], pollsByCandidate[1], xScale, yScale);

  layout.candidateAreas = [];

  const convertAreaData = d3.area()
    .x(d => round1dp(xScale(new Date(d.date))))
    .y0(d => round1dp(yScale(d.Clinton)))
    .y1(d => round1dp(yScale(d.Trump)));

  if (intersections.points.length > 0) {
    let firstDataPointDate = new Date(formattedData[0].date);
    let lastDataPointDate;

    {
      let filteredFormattedData = [];
      let areaColor = 'grey';

      const point = intersections.points[0];
      const pointDate = new Date(xScale.invert(point.x));
      const pointValue = yScale.invert(point.y);

      filteredFormattedData = _.filter(
        formattedData,
        row => new Date(row.date) >= firstDataPointDate && new Date(row.date) < pointDate
      );

      filteredFormattedData.push({
        date: pointDate,
        Clinton: pointValue,
        Trump: pointValue,
      });

      if (formattedData[0].Clinton > formattedData[0].Trump) {
        areaColor = candidateColor.Clinton.area;
      } else {
        areaColor = candidateColor.Trump.area;
      }

      layout.candidateAreas.push({
        d: convertAreaData(filteredFormattedData),
        fill: areaColor,
      });
    }

    for (let i = 0; i < intersections.points.length; i += 1) {
      const point = intersections.points[i];
      const pointDate = new Date(xScale.invert(point.x));
      const pointValue = yScale.invert(point.y);

      let filteredFormattedData = [];
      let areaColor = 'grey';

      if (i === intersections.points.length - 1) { // if last breakpoint
        lastDataPointDate = new Date(formattedData[formattedData.length - 1].date);
        filteredFormattedData = formattedData.filter(row => // eslint-disable-line no-loop-func
          new Date(row.date) <= lastDataPointDate && new Date(row.date) > pointDate
        );

        filteredFormattedData.unshift({
          date: pointDate,
          Clinton: pointValue,
          Trump: pointValue,
        });

        if (formattedData[formattedData.length - 1].Clinton > formattedData[formattedData.length - 1].Trump) {
          areaColor = candidateColor.Clinton.area;
        } else {
          areaColor = candidateColor.Trump.area;
        }
      } else { // for everything else
        firstDataPointDate = pointDate;
        lastDataPointDate = new Date(xScale.invert(intersections.points[i + 1].x));
        filteredFormattedData = formattedData.filter(row => // eslint-disable-line no-loop-func
          new Date(row.date) <= lastDataPointDate && new Date(row.date) >= firstDataPointDate
        );
        const checkIndex = Math.max(0, Math.ceil((filteredFormattedData.length / 2) - 1));
        if (filteredFormattedData.length > 0 && (filteredFormattedData[checkIndex].Clinton > filteredFormattedData[checkIndex].Trump)) {
          areaColor = candidateColor.Clinton.area;
        } else {
          areaColor = candidateColor.Trump.area;
        }
        filteredFormattedData.unshift({
          date: firstDataPointDate,
          Clinton: pointValue,
          Trump: pointValue,
        });
        filteredFormattedData.push({
          date: lastDataPointDate,
          Clinton: yScale.invert(intersections.points[i + 1].y),
          Trump: yScale.invert(intersections.points[i + 1].y),
        });
      }

      layout.candidateAreas.push({
        d: convertAreaData(filteredFormattedData),
        fill: areaColor,
      });
    }
  } else {
    const filteredFormattedData = formattedData;
    let areaColor;

    if (filteredFormattedData[0].Clinton > filteredFormattedData[0].Trump) {
      areaColor = candidateColor.Clinton.area;
    } else {
      areaColor = candidateColor.Trump.area;
    }

    layout.candidateAreas.push({
      d: convertAreaData(filteredFormattedData),
      fill: areaColor,
    });
  }

  layout.candidateEndPoints = pollsByCandidate.map(d => {
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
  layout.numPoints = data.length / data[0].pollnumcandidates;
  return layout;
}

module.exports = timeseriesLayout;
