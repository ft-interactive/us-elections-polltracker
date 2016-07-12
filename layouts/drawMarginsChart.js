const d3 = require('d3');
const getJSDomWindow = require('./getJSDomWindow');

function round_1dp(x) {
  return Math.round(x * 10) / 10;
}

async function drawMarginsChart(width, height, fontless, background, startDate, endDate, type, data) {
  const htmlStub = '<html><head></head><body><div id="dataviz-container"></div><script src="https://d3js.org/d3.v4.min.js"></script></body></html>';

  const window = await getJSDomWindow(htmlStub);

  const el = window.document.querySelector('#dataviz-container');

  const graphWidth = width;
  const graphHeight = height;
  const margins = { top: 75, bottom: 50, left: 40, right: 30 };
  const userInputParse = d3.timeParse('%B %e, %Y');
  const colors = { Clinton: '#579dd5', Trump: '#e03d46' };

  // format for d3.stack
  const formattedData = [];
  Object.keys(data).forEach(function(date) {
    let clintonVal;
    let trumpVal;

    if (data[date][0].candidatename === 'Clinton') {
      clintonVal = data[date][0].pollaverage;
      trumpVal = data[date][1].pollaverage;
    } else {
      clintonVal = data[date][1].pollaverage;
      trumpVal = data[date][0].pollaverage;
    }

    formattedData.push({
      date: date,
      Clinton: Math.max(0, round_1dp(clintonVal - trumpVal)),
      Trump: Math.min(0, round_1dp(clintonVal - trumpVal)),
    });
  });

  // need more margin right if end date is too close to last datapoint
  const firstKey = d3.keys(data)[0];
  if (((new Date(userInputParse(endDate)) - new Date(d3.keys(data)[d3.keys(data).length - 1])) / 86400000) < 60) {
    margins.right = 90 - ((new Date(userInputParse(endDate)) - new Date(d3.keys(data)[d3.keys(data).length - 1])) / 86400000);
  }

  const svg = d3.select(el)
    .append('svg')
    .attr('id', 'chart')
    .attr('width', graphWidth)
    .attr('height', graphHeight);

  const yScale = d3.scaleLinear()
    .domain([-2, 20])
    .range([graphHeight - margins.top - margins.bottom, 0]);

  const yAxis = d3.axisLeft()
    .scale(yScale)
    .tickSizeInner(graphWidth - margins.left - margins.right)
    .tickSizeOuter(0)
    .tickPadding(-margins.left)
    .tickFormat(function(d) {
      return Math.abs(d);
    });

  const yLabel = svg.append('g')
    .attr('class', 'yAxis')
    .attr('transform', function() {
      return 'translate(' + (round_1dp(graphWidth - margins.right)) + ',' + margins.top + ')';
    })
    .call(yAxis);

  yLabel.selectAll('text')
    .attr('transform', function() {
        return 'translate(' + (-margins.left - 7) + ',-10)';
    })
    .style('fill', function(d) {
      if (d === 0) {
        return '#6b6e68';
      } else if (d < 0) {
        return colors.Trump;
      } else if (d > 0) {
        return colors.Clinton;
      }
    });

  const xScale = d3.scaleTime()
    .domain([userInputParse(startDate), userInputParse(endDate)])
    .range([0, graphWidth - margins.left - margins.right]);

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

  const dataContainer = svg.append('g')
    .attr('class', 'dataContainer')
    .attr('transform', function() {
      return 'translate('+(margins.left)+','+(margins.top)+')'
    });

  const stack = d3.stack()
    .keys(['Clinton', 'Trump'])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone)

  const series = stack(formattedData);

  const converttoAreaData = d3.area()
    .x(function(d) { return round_1dp(xScale(new Date(d.data.date))); })
    .y0(function(d) { return yScale(d[0]); })
    .y1(function(d) { return yScale(d[1]); });

  const dataArea = dataContainer.selectAll('g.dataArea')
    .data(series)
    .enter()
    .append('g')
    .attr('class', 'dataArea');

  const dataPath = dataArea.append('path')
    .attr('d', converttoAreaData)
    .style('fill', function(d) {
      return colors[d.key];
    })
    .style('stroke-width', 0);

  const annotationGroup = svg.append('g')
    .attr('class', 'annotations')
    .attr('transform', function() {
      return 'translate('+(margins.left)+','+(margins.top)+')'
    });

  const lastPointText = annotationGroup.selectAll('text.lastpointtext')
    .data(series)
    .enter()
    .append('text')
    .attr('class', 'lastpointtext')
    .text(function(d) {
      if (d[d.length - 1].data.Clinton !== 0) {
        return 'Clinton +' + d[d.length - 1].data.Clinton;
      }
      if (d[d.length - 1].data.Trump !== 0) {
        return 'Trump +' + (-d[d.length - 1].data.Trump);
      }
    })
    .attr('x', function(d) {
      return round_1dp(xScale(new Date(d[d.length - 1].data.date))) + 10;
    })
    .attr('y', function(d) {
      if (d[d.length - 1].data.Clinton !== 0) {
        return round_1dp(yScale(d[d.length - 1].data.Clinton)) + 10;
      }
      if (d[d.length - 1].data.Trump !== 0) {
        return round_1dp(yScale(d[d.length - 1].data.Trump)) + 10;
      }
    })
    .style('fill', function(d) {
      if (d[d.length - 1].data.Clinton !== 0) {
        return colors.Clinton;
      }
      if (d[d.length - 1].data.Trump !== 0) {
        return colors.Trump;
      }
    });

  const headline = annotationGroup.append('text')
    .text(function() {
      if (graphWidth < 450) {
        return 'US Election 2016: latest polls'; // return shorter head for narrow graphs
      }
      return 'Which White House candidate is leading in the polls?';
    })
    .attr('class', 'headline')
    .attr('x', -margins.left / 2)
    .attr('y', -margins.top + 24);

  const subhead = annotationGroup.append('text')
    .text('National margins as of ' + d3.timeFormat('%B %e, %Y')(new Date(formattedData[formattedData.length - 1].date)))
    .attr('class', 'subhead')
    .attr('x', -margins.left / 2)
    .attr('y', -margins.top + 46);

  const sourceline = annotationGroup.append('text')
    .text('Source: Real Clear Politics')
    .attr('class', 'sourceline')
    .attr('x', -margins.left / 2)
    .attr('y', graphHeight - margins.top - 10)
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

module.exports = drawMarginsChart;

