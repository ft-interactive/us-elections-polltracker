const d3 = require('d3');
const getJSDomWindow = require('./getJSDomWindow');
const _ = require('underscore');
const stateIds = require('./stateIds').states;

function round_1dp(x) {
  return Math.round(x * 10) / 10;
}

async function drawChart(width, height, fontless, background, logo, startDate, endDate, type, state, data) {
  const htmlStub = '<html><head></head><body><div id="dataviz-container"></div><script src="https://d3js.org/d3.v4.min.js"></script></body></html>';

  const window = await getJSDomWindow(htmlStub);

  const el = window.document.querySelector('#dataviz-container');

  const graphWidth = width;
  const graphHeight = height;
  const margins = { top: 70, bottom: 50, left: 30, right: 30 };
  const userInputParse = d3.timeParse('%B %e, %Y');
  const colors = { Clinton: '#238fce', Trump: '#e5262d' };

  const data_groupedBy_candidate = _.groupBy(data, function(row) { return row.candidatename; });
  const data_groupedBy_date = _.groupBy(data, function(row) { return row.date; });

  // need more margin right if end date is too close to last datapoint
  if (((new Date(userInputParse(endDate)) - new Date(d3.keys(data_groupedBy_date)[d3.keys(data_groupedBy_date).length - 1])) / 86400000) < 60) {
    margins.right = 90 - ((new Date(userInputParse(endDate)) - new Date(d3.keys(data_groupedBy_date)[d3.keys(data_groupedBy_date).length - 1])) / 86400000);
  }

  // format for d3.stack
  const formattedData = [];
  Object.keys(data_groupedBy_date).forEach(function(date) {
    let clintonVal;
    let trumpVal;

    if (data_groupedBy_date[date][0].candidatename === 'Clinton') {
      clintonVal = data_groupedBy_date[date][0].pollaverage;
      trumpVal = data_groupedBy_date[date][1].pollaverage;
    } else {
      clintonVal = data_groupedBy_date[date][1].pollaverage;
      trumpVal = data_groupedBy_date[date][0].pollaverage;
    }

    formattedData.push({
      date: date,
      Clinton: clintonVal,
      Trump: trumpVal,
    });
  });

  const svg = d3.select(el)
    .append('svg')
    .attr('id', 'chart')
    .attr('width', graphWidth)
    .attr('height', graphHeight);

  const [min, max] = d3.extent(data, (d) => d.pollaverage);
  const yScalePadding = (max - min) / 4;

  const yScale = d3.scaleLinear()
    .domain([min - yScalePadding, max + yScalePadding])
    .range([graphHeight - margins.top - margins.bottom, 0]);

  const yAxis = d3.axisLeft()
    .scale(yScale)
    .tickSizeInner(graphWidth - margins.left - margins.right)
    .tickSizeOuter(0)
    .ticks(7)
    .tickPadding(-margins.left);

  const yLabel = svg.append('g')
    .attr('class', 'yAxis')
    .attr('transform', function() {
      return 'translate(' + (round_1dp(graphWidth - margins.right)) + ',' + margins.top + ')';
    })
    .call(yAxis);

  yLabel.selectAll('text')
      .attr('transform', function() {
          return 'translate(' + (-margins.left - 7) + ',0)';
      });

  const xScale = d3.scaleTime()
    .domain([userInputParse(startDate), userInputParse(endDate)])
    .range([0, graphWidth - margins.left - margins.right]);

  const xAxisTicks = [userInputParse(startDate), userInputParse(endDate)];

  const xAxis = d3.axisBottom()
    .scale(xScale)
    .tickValues(xAxisTicks)
    .tickFormat(function(d) {
      return d3.timeFormat('%b %e, %Y')(d);
    });

  const xLabel = svg.append('g')
    .attr('class', 'xAxis')
    .attr('transform', function() {
      return 'translate(' + (margins.left) + ',' + (graphHeight - margins.bottom) + ')';
    })
    .call(xAxis);

  xLabel.selectAll('text')
    .style('text-anchor', function(d, i) {
      if (i === 0) {
        return 'start';
      }
      return 'end';
    });

  if (type === 'area') {
    const candidateAreas = svg.append('g')
      .datum(formattedData)
      .attr('transform', function() {
        return 'translate('+(margins.left)+','+(margins.top)+')'
      });

    const area = d3.area()
      .x(function(d) { return round_1dp(xScale(new Date(d.date))); })
      .y1(function(d) { return round_1dp(yScale(d.Clinton)); });

    candidateAreas.append('clipPath')
      .attr('id', 'clip-below')
      .append('path')
      .attr('d', area.y0(graphHeight));

    candidateAreas.append('clipPath')
      .attr('id', 'clip-above')
      .append('path')
      .attr('d', area.y0(0));

    candidateAreas.append('path')
      .attr('class', 'area above')
      .attr('clip-path', 'url(#clip-above)')
      .attr('d', area.y0(function(d) { return round_1dp(yScale(d.Trump)); }));

    candidateAreas.append('path')
      .attr('class', 'area below')
      .attr('clip-path', 'url(#clip-below)')
      .attr('d', area);
  }

  const candidateGroups = svg.selectAll('g.candidateLine')
    .data(d3.keys(data_groupedBy_candidate))
    .enter()
    .append('g')
    .attr('class', function(d) { return 'candidate ' + d; })
    .attr('transform', function() {
      return 'translate('+(margins.left)+','+(margins.top)+')'
    });

  const convertLineData = d3.line()
      .x(function(d) { return round_1dp(xScale(d.date)); })
      .y(function(d) { return round_1dp(yScale(d.pollaverage)); });

  const candidateLine = candidateGroups.append('path')
    .attr('class', 'candidateLine')
    .attr('d', function(d) { return convertLineData(data_groupedBy_candidate[d]); })
    .style('stroke', function(d) { return colors[d]; })
    .style('stroke-width', '2');

  const annotationGroup = svg.append('g')
    .attr('class', 'annotations')
    .attr('transform', function() {
      return 'translate('+(margins.left)+','+(margins.top)+')'
    });

  const lastPointLabels = annotationGroup.selectAll('circle.lastpointlabel')
    .data(d3.keys(data_groupedBy_candidate))
    .enter()
    .append('circle')
    .attr('class', 'lastpointlabel')
    .attr('cx', function(d) {
      return round_1dp(xScale(data_groupedBy_candidate[d][data_groupedBy_candidate[d].length - 1].date));
    })
    .attr('cy', function(d) {
      return round_1dp(yScale(data_groupedBy_candidate[d][data_groupedBy_candidate[d].length - 1].pollaverage));
    })
    .attr('r', '3.66')
    .style('fill', function(d) { return colors[d]; });

  const lastPointText = annotationGroup.selectAll('text.lastpointtext')
    .data(d3.keys(data_groupedBy_candidate))
    .enter()
    .append('text')
    .attr('class', 'lastpointtext')
    .text(function(d) { return data_groupedBy_candidate[d][data_groupedBy_candidate[d].length - 1].pollaverage + ' ' + d; })
    .attr('x', function(d) {
      return round_1dp(xScale(data_groupedBy_candidate[d][data_groupedBy_candidate[d].length - 1].date)) + 10;
    })
    .attr('y', function(d) {
      let onTop; // adjust for when labels overlap
      let yOverlapOffset;

      if (data_groupedBy_candidate.Clinton[data_groupedBy_candidate.Clinton.length - 1].pollaverage > data_groupedBy_candidate.Trump[data_groupedBy_candidate.Trump.length - 1].pollaverage) {
        onTop = 'Clinton';
      }
      if (data_groupedBy_candidate.Clinton[data_groupedBy_candidate.Clinton.length - 1].pollaverage < data_groupedBy_candidate.Trump[data_groupedBy_candidate.Trump.length - 1].pollaverage) {
        onTop = 'Trump';
      }

      if (d === onTop) {
        yOverlapOffset = 5;
      } else {
        yOverlapOffset = -5;
      }

      return round_1dp(yScale(data_groupedBy_candidate[d][data_groupedBy_candidate[d].length - 1].pollaverage) - yOverlapOffset);
    })
    .style('fill', function(d) { return colors[d]; });

  const headline = annotationGroup.append('text')
    .text(function() {
      const stateName = _.findWhere(stateIds, { 'state': state.toUpperCase() }).stateName;
      if (graphWidth < 450) {
        if (state === 'us') {
          return 'Latest polls';
        }
        return `Latest polls: ${stateName}`;
      }
      if (state === 'us') {
        return 'Which White House candidate is leading in the polls?';
      }
      return `Which candidate is leading in ${stateName}?`;
    })
    .attr('class', 'headline')
    .attr('x', -margins.left + 7)
    .attr('y', -margins.top + 24);

  const subhead = annotationGroup.append('text')
    .text(function() {
      let statePrefix;
      if (width < 300) {
        statePrefix = 'Polling ';
      } else {
        if (state === 'us') {
          statePrefix = 'National polling ';
        } else {
          statePrefix = 'Polling ';
        }
      }

      return statePrefix + 'average as of ' + d3.timeFormat('%B %e, %Y')(new Date(formattedData[formattedData.length - 1].date)) + ' (%)'
    })
    .attr('class', 'subhead')
    .attr('x', -margins.left + 7)
    .attr('y', -margins.top + 46);

  const sourceline = annotationGroup.append('text')
    .text('Source: Real Clear Politics')
    .attr('class', 'sourceline')
    .attr('x', -margins.left + 7)
    .attr('y', graphHeight - margins.top - 10)
    .style('text-anchor', 'start');

  const config = {
    width: width,
    height: height,
    background: background,
    fontless: fontless,
    logo: logo,
    svgContent: window.d3.select('svg').html().toString().replace(/clippath/g, 'clipPath'),
  }; // return this back to the router

  return config;
}

module.exports = drawChart;
