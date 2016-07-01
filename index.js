require('loud-rejection/register');

var express = require('express'),
	drawChart = require('./layouts/drawChart.js'),
	nunjucks = require('nunjucks'),
	DOMParser = require('xmldom').DOMParser,
	fs = require('fs'),
	_ = require('underscore')

var app = express();
const maxAge = 120; // for user agent caching purposes

nunjucks.configure('views', {
	autoescape: true,
	express: app
}).addFilter('rawSVG', function(fragment){
	var parser = new DOMParser();
	return parser.parseFromString(fragment, "image/svg+xml")
});

// routes
app.get('/__gtg', function(req, res){
	res.send('ok');
});

app.get('/', function (req, res) {
	res.send('The format for URLs is: https://ft-ig-us-elections-polling.herokuapp.com/polls?size=300x400&type=both&startDate=July 26,2015&endDate=now&fontless=true&background=#fff1e0');
});

app.get('/polls.svg', async function(req, res) {
	var fontless = req.query.fontless || true,
		background = req.query.background || "#fff1e0",
		startDate = req.query.startDate || "July 1, 2015",
		endDate = req.query.endDate || "July 1, 2016", // TODO change to current date
		size = req.query.size || "600x300",
		width = size.split("x")[0],
		height = size.split("x")[1],
		type = req.query.type || "margins";

	var data = JSON.parse(fs.readFileSync('./layouts/rcpdata.json', 'utf8'));

	// filter out dates not between startDate and endDate
	Object.keys(data.data).forEach(function(candidate) {
		var filtered = _.filter(data.data[candidate], function(row) { return Date.parse(row.date) >= Date.parse(startDate) && Date.parse(row.date) <= Date.parse(endDate);  })
		data.data[candidate] = filtered;
	})

	try {
		var chartLayout = await drawChart(width, height, fontless, background, startDate, endDate, type, data);
		var value = nunjucks.render( 'poll.svg', chartLayout );
		setSVGHeaders(res).send(value);
	}
	catch (error) {
		console.error(error);
		res.status(500).send('something broke');
	}
});

// utility functions
function setSVGHeaders(res){
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Content-Type', 'image/svg+xml');
		res.setHeader('Cache-Control', 'public, max-age=' + maxAge);
		return res;
}


const server = app.listen(process.env.PORT || 5000, function () {
	const host = server.address().address;
	const port = server.address().port;
	console.log(`running ${host} ${port}`);
});
