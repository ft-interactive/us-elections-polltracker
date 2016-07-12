const d3 = require('d3');
const getJSDomWindow = require('./getJSDomWindow');

function round_1dp(x) {
  return Math.round(x * 10) / 10;
}

async function drawPollAvgChart(width, height, startDate, endDate, type, data) {

  const htmlStub = '<html><head></head><body><div id="dataviz-container"></div><script src="https://d3js.org/d3.v4.min.js"></script></body></html>';

  const window = await getJSDomWindow(htmlStub);

  const el = window.document.querySelector('#dataviz-container');

  const graphWidth = width;
  const graphHeight = height;
  // const margins = { top: 55, bottom: 50, left: 20, right: 30 };
  const margins = { top: 55, bottom: 50, left: 30, right: 30 };
  const userInputParse = d3.timeParse('%B %e, %Y');
  const colors = { Clinton: '#238fce', Trump: '#e5262d' };

  // need more margin right if end date is too close to last datapoint
  // console.log('dates', ((new Date(userInputParse(endDate)) - new Date(data.Clinton[data.Clinton.length - 1].date)) / 86400000));
  if (((new Date(userInputParse(endDate)) - new Date(data.Clinton[data.Clinton.length - 1].date)) / 86400000) < 60) {
    margins.right = 90 - ((new Date(userInputParse(endDate)) - new Date(data.Clinton[data.Clinton.length - 1].date)) / 86400000);
  }

  const svg_wrapper = d3.select(el)
    .append('svg')
    .attr('id', 'chart')
    .attr('width', graphWidth)
    .attr('height', graphHeight);

  const svg = svg_wrapper.append('g')
    .attr('class', 'pollAvg-chart')
    .attr('width', graphWidth)
    .attr('height', graphHeight);

  const annotationGroup = svg.append('g')
    .attr('class', 'annotations')
    .attr('transform', function() {
      return 'translate('+(margins.left)+','+(margins.top)+')'
    });

  const yScale = d3.scaleLinear()
    .domain([30, 55])
    .range([graphHeight - margins.top - margins.bottom, 0]);

  const yAxis = d3.axisLeft()
    .scale(yScale)
    .tickSizeInner(graphWidth - margins.left - margins.right)
    .tickSizeOuter(0)
    .ticks(3)
    .tickPadding(-margins.left);

  const yLabel = svg.append('g')
    .attr('class', 'yAxis')
    .attr('transform', function() {
      return 'translate(' + (round_1dp(graphWidth - margins.right)) + ',' + margins.top + ')';
    })
    .call(yAxis);

  yLabel.selectAll('text')
    // .attr('transform', function() {
    //     return 'translate(' + (-margins.left / 2) + ',-10)';
    // })
    .attr('transform', function() {
      return 'translate(' + (-margins.left - 7) + ',-10)';
    });

  const xScale = d3.scaleTime()
    .domain([userInputParse(startDate), userInputParse(endDate)])
    .range([0, graphWidth - margins.left - margins.right]);

  if (type === 'pollAvg') { // don't show xAxis in combined chart, use margins xAxis
    const xAxisTicks = [userInputParse(startDate), userInputParse(endDate)];

    const xAxis = d3.axisBottom()
      .scale(xScale)
      .tickValues(xAxisTicks)
      .tickFormat(function(d, i) {
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

    const sourceline = annotationGroup.append('text')
      .text('Source: Real Clear Politics')
      .attr('class', 'sourceline')
      .attr('x', -margins.left + 7)
      .attr('y', graphHeight - margins.top - 10)
      .style('text-anchor', 'start');
  }

  const candidateGroups = svg.selectAll('g.candidate')
    .data(d3.keys(data))
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
    .attr('d', function(d) { return convertLineData(data[d]); })
    .style('stroke', function(d) { return colors[d]; })
    .style('stroke-width', '2');

  const lastPointLabels = annotationGroup.selectAll('circle.lastpointlabel')
    .data(d3.keys(data))
    .enter()
    .append('circle')
    .attr('class', 'lastpointlabel')
    .attr('cx', function(d) {
      return round_1dp(xScale(data[d][data[d].length - 1].date));
    })
    .attr('cy', function(d) {
      return round_1dp(yScale(data[d][data[d].length - 1].pollaverage));
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
      return round_1dp(xScale(data[d][data[d].length - 1].date)) + 10;
    })
    .attr('y', function(d) {
      let onTop; // adjust for when labels overlap
      let yOverlapOffset;

      if (data.Clinton[data.Clinton.length - 1].pollaverage > data.Trump[data.Trump.length - 1].pollaverage) {
        onTop = 'Clinton';
      }
      if (data.Clinton[data.Clinton.length - 1].pollaverage < data.Trump[data.Trump.length - 1].pollaverage) {
        onTop = 'Trump';
      }

      if (d === onTop) {
        yOverlapOffset = 5;
      } else {
        yOverlapOffset = -5;
      }

      return round_1dp(yScale(data[d][data[d].length - 1].pollaverage) - yOverlapOffset);
    })
    .style('fill', function(d) { return colors[d]; });

  const headline = annotationGroup.append('text')
    .text(function() {
      if (graphWidth < 450) {
        return 'US Election 2016: latest polls'; // return shorter head for narrow graphs
      }
      return 'Which White House candidate is leading in the polls?';
    })
    .attr('class', 'headline')
    .attr('x', -margins.left + 7)
    .attr('y', -margins.top + 24);

  const subhead = annotationGroup.append('text')
    .text('National polling average as of ' + d3.timeFormat('%B %e, %Y')(data.Clinton[data.Clinton.length - 1].date) + ' (%)')
    .attr('class', 'subhead')
    .attr('x', -margins.left + 7)
    .attr('y', -margins.top + 46);

  return window.d3.select('svg').html().toString();
}

module.exports = drawPollAvgChart;
