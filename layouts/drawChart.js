const d3 = require('d3');
const getJSDomWindow = require('./getJSDomWindow');

async function drawChart(width, height, fontless, background, startDate, endDate, type, data) {
  const htmlStub = '<html><head></head><body><div id="dataviz-container"></div><script src="https://d3js.org/d3.v4.min.js"></script></body></html>';

  const window = await getJSDomWindow(htmlStub);

  const el = window.document.querySelector('#dataviz-container');

  const graphWidth = width;
  const graphHeight = height;
  const margins = { top: 55, bottom: 50, left: 20, right: 50 };
  const userInputParse = d3.timeParse('%B %e, %Y');
  const colors = { Clinton: '#5a8caf', Trump: '#b34b41' };

  // @TODO need more margin right if end date is too close to last datapoint
  // console.log('dates', new Date(userInputParse(endDate)) - new Date(data.Clinton[data.Clinton.length - 1].date));
  if (new Date(userInputParse(endDate)) < new Date(data.Clinton[data.Clinton.length - 1].date) + 170200000) {
    margins.right = 100;
  }

  const svg = d3.select(el)
    .append('svg')
    .attr('id', 'chart')
    .attr('width', graphWidth)
    .attr('height', graphHeight);

  const yScale = d3.scaleLinear()
    .domain([30, 55])
    .range([graphHeight - margins.top - margins.bottom, 0]);

  const yAxis = d3.axisRight()
    .scale(yScale)
    .tickSizeInner(-graphWidth + margins.left + margins.right)
    .tickSizeOuter(0)
    .ticks(3)
    .tickPadding(margins.right - 15);

  const yLabel = svg.append('g')
    .attr('class', 'yAxis')
    .attr('transform', function() {
      return 'translate(' + (graphWidth - margins.right) + ',' + margins.top + ')';
    })
    .call(yAxis);

  // const yAxisLabel = yLabel.append('text')
  //   .text('%')
  //   .style('text-anchor', 'start')
  //   .attr('class', 'axisLabel')
  //   .attr('x', -graphWidth + margins.right + margins.left)
  //   .attr('y', 0);

  const xScale = d3.scaleTime()
    .domain([userInputParse(startDate), userInputParse(endDate)])
    .range([0, graphWidth - margins.left - margins.right]);

  const xAxis = d3.axisBottom()
    .scale(xScale)
    .tickSizeOuter(5)
    .tickFormat(d3.timeFormat('%b'))
    .ticks(5);

  const xLabel = svg.append('g')
    .attr('class', 'xAxis')
    .attr('transform', function() {
      return 'translate('+(margins.left)+','+(graphHeight-margins.bottom)+')'
    })
    .call(xAxis);

  const candidateGroups = svg.selectAll('g.candidate')
    .data(d3.keys(data))
    .enter()
    .append('g')
    .attr('class', function(d) { return 'candidate ' + d; })
    .attr('transform', function() {
      return 'translate('+(margins.left)+','+(margins.top)+')'
    });

  const convertLineData = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.pollaverage); });

  const candidateLine = candidateGroups.append('path')
    .attr('class', 'candidateLine')
    .attr('d', function(d) { return convertLineData(data[d]); })
      .style('stroke', function(d) { return colors[d]; })
      .style('stroke-width', '2');

  const annotationGroup = svg.append('g')
    .attr('class', 'annotations')
    .attr('transform', function() {
      return 'translate('+(margins.left)+','+(margins.top)+')'
    })

  const lastPointLabels = annotationGroup.selectAll('circle.lastpointlabel')
    .data(d3.keys(data))
    .enter()
    .append('circle')
    .attr('class', 'lastpointlabel')
    .attr('cx', function(d) {
      return xScale(data[d][data[d].length - 1].date);
    })
    .attr('cy', function(d) {
      return yScale(data[d][data[d].length - 1].pollaverage);
    })
    .attr('r', '5')
    .style('fill', function(d) { return colors[d]; });

  const lastPointText = annotationGroup.selectAll('text.lastpointtext')
    .data(d3.keys(data))
    .enter()
    .append('text')
    .attr('class', 'lastpointtext')
    .text(function(d) { return data[d][data[d].length - 1].pollaverage + ' ' + d; })
    .attr('x', function(d) {
      return xScale(data[d][data[d].length - 1].date) + 10;
    })
    .attr('y', function(d) {
      return yScale(data[d][data[d].length - 1].pollaverage);
    })
    .style('fill', function(d) { return colors[d]; });

  const headline = annotationGroup.append('text')
    .text('Which White House candidate is leading in the polls?')
    .attr('class', 'headline')
    .attr('x', -margins.left / 2)
    .attr('y', -margins.top + 24);

  const subhead = annotationGroup.append('text')
    .text('National polling average as of ' + d3.timeFormat('%B %e, %Y')(data.Clinton[data.Clinton.length - 1].date) + ' (%)')
    .attr('class', 'subhead')
    .attr('x', -margins.left / 2)
    .attr('y', -margins.top + 46);

  const sourceline = annotationGroup.append('text')
    .text('Source: Real Clear Politics')
    .attr('class', 'sourceline')
    .attr('x', -margins.left / 2)
    .attr('y', height - margins.top - 10)
    .style('text-anchor', 'start');

  const config = {
    width: width,
    height: height,
    background: background,
    fontless: fontless,
    svgContent: window.d3.select('svg').html().toString(),
  }; // return this back to the router

  return config;
}

module.exports = drawChart;
