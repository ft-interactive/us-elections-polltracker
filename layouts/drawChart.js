var d3 = require('d3'),
	getJSDomWindow = require('./getJSDomWindow');

async function drawChart(width, height, fontless, background, startDate, endDate, type, data) {
	var htmlStub = '<html><head></head><body><div id="dataviz-container"></div><script src="https://d3js.org/d3.v4.min.js"></script></body></html>';

	var window = await getJSDomWindow(htmlStub);

	var el = window.document.querySelector("#dataviz-container");

	var graphWidth = width,
		graphHeight = height,
		margins = {"top": 30, "bottom": 30, "left": 10, "right": 50},
		parse = d3.timeParse("%a, %d %b %Y %H:%M:%S %Z"),
		userInputParse = d3.timeParse("%B %e, %Y");

	var svg = d3.select(el)
		.append("svg")
		.attr("id", "chart")
		.attr("width", graphWidth)
		.attr("height", graphHeight)

	var yScale = d3.scaleLinear()
		.domain([30, 55])
		.range([graphHeight-margins.top-margins.bottom, 0])

	var yAxis = d3.axisRight()
		.scale(yScale)
		.tickSizeInner(-graphWidth+margins.left+margins.right)
		.tickSizeOuter(0)
		.ticks(3)
		.tickPadding(margins.right-15)

	var yLabel = svg.append("g")
		.attr("class", "yAxis")
		.attr("transform",function() {
					return "translate("+(graphWidth-margins.right)+","+margins.top+")"
			})
		.call(yAxis)

	var yAxisLabel = yLabel.append("text")
		.text("%")
		.style('text-anchor', 'start')
		.attr("class", "axisLabel")
		.attr("x", -graphWidth+margins.right+margins.left+10)
		.attr("y", -20)

	var xScale = d3.scaleTime()
		.domain([userInputParse(startDate), userInputParse(endDate)])
		.range([0, graphWidth-margins.left-margins.right])

	var xAxis = d3.axisBottom()
		.scale(xScale)
		.tickSizeOuter(5)
		.ticks(5)


	var xLabel = svg.append("g")
		.attr("class", "xAxis")
		.attr("transform",function() {
			return "translate("+(margins.left)+","+(graphHeight-margins.bottom)+")"
		})
		.call(xAxis)

	var candidateGroups = svg.selectAll("g.candidate")
		.data(d3.keys(data.data))
		.enter()
		.append("g")
		.attr("class", function(d) { return "candidate " + d; })
		.attr("transform",function() {
			return "translate("+(margins.left)+","+(margins.top)+")"
		})

	var convertLineData = d3.line()
		.x(function(d) { return xScale(parse(d.date)) })
		.y(function(d) { return yScale(d.value) })

	var candidateLine = candidateGroups.append("path")
		.attr("class", "candidateLine")
		.attr("d", function(d) { return convertLineData(data.data[d]) })
			.style("stroke", function(d) {
				if (d == "Clinton") {
					return "#5a8caf";
				}
				return "#b34b41";
			})
			.style("stroke-width", "2")

	var config = { 
		"width": width, 
		"height": height, 
		"background": background, 
		"fontless": fontless,
		"svgContent": window.d3.select("svg").html().toString()
	} // return this back to the router
	
	return config;
}

module.exports = drawChart;
