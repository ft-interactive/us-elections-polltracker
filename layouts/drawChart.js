var d3 = require('d3'),
	getJSDomWindow = require('./getJSDomWindow');

async function drawChart(width, height, fontless, background, startDate, endDate, type, data) {
	var htmlStub = '<html><head></head><body><div id="dataviz-container"></div><script src="https://d3js.org/d3.v4.min.js"></script></body></html>';

	var window = await getJSDomWindow(htmlStub);

	var el = window.document.querySelector("#dataviz-container");

	var graphWidth = width,
		graphHeight = height,
		margins = {"top": 30, "bottom": 30, "left": 20, "right": 50},
		userInputParse = d3.timeParse("%B %e, %Y"),
		colors = {"Clinton": "#5a8caf", "Trump": "#b34b41"};

	// need more margin right if end date is too close to last datapoint
	console.log('dates', new Date(userInputParse(endDate)) - new Date(data["Clinton"][data["Clinton"].length-1].date));
	if (new Date(userInputParse(endDate)) < new Date(data["Clinton"][data["Clinton"].length-1].date) + 170200000) {
		margins.right = 100;
	}

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
		.data(d3.keys(data))
		.enter()
		.append("g")
		.attr("class", function(d) { return "candidate " + d; })
		.attr("transform",function() {
			return "translate("+(margins.left)+","+(margins.top)+")"
		})

	var convertLineData = d3.line()
		.x(function(d) { return xScale(d.date) })
		.y(function(d) { return yScale(d.pollaverage) })

	var candidateLine = candidateGroups.append("path")
		.attr("class", "candidateLine")
		.attr("d", function(d) { return convertLineData(data[d]) })
			.style("stroke", function(d) { return colors[d]; })
			.style("stroke-width", "2")

	var annotationGroup = svg.append("g")
		.attr("class", "annotations")
		.attr("transform",function() {
			return "translate("+(margins.left)+","+(margins.top)+")"
		})

	// var candidateLabels = annotationGroup.selectAll("text.candidatename")
	// 	.data(d3.keys(data))
	// 	.enter()
	// 	.append("text")
	// 	.attr("class", "candidatename")
	// 	.text(function(d) {
	// 		return d;
	// 	})
	// 	.attr("x", function(d) { return xScale(data[d][0].date); })
	// 	.attr("y", function(d) { 
	// 		var offset = 10;
	// 		if (d == "Trump") {
	// 			offset = -20;
	// 		}
	// 		return yScale(data[d][0].pollaverage) - offset; 
	// 	})
	// 	.style("fill", function(d) { return colors[d]; })

	var lastPointLabels = annotationGroup.selectAll('circle.lastpointlabel')
		.data(d3.keys(data))
		.enter()
		.append("circle")
		.attr("class", "lastpointlabel")
		.attr("cx", function(d) {
			return xScale(data[d][data[d].length-1].date);
		})
		.attr("cy", function(d) {
			return yScale(data[d][data[d].length-1].pollaverage);
		})
		.attr("r", "5")
		.style("fill", function(d) { return colors[d]; })
	
	var lastPointText = annotationGroup.selectAll('text.lastpointtext')	
		.data(d3.keys(data))
		.enter()
		.append("text")
		.attr("class", "lastpointtext")
		.text(function(d) { return data[d][data[d].length-1].pollaverage + " " + d; })
		.attr("x", function(d) {
			return xScale(data[d][data[d].length-1].date) + 10;
		})
		.attr("y", function(d) {
			return yScale(data[d][data[d].length-1].pollaverage);
		})	
		.style("fill", function(d) { return colors[d]; })

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
