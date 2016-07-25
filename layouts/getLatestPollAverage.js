var	db = require('../models/index'),
	_ = require('underscore'),
	d3 = require('d3'),
	Pollaverages = require('../models/index').Pollaverages;

const deleteTimezoneOffset = d3.timeFormat('%B %e, %Y');

// runs a psql query to get data from db
async function getLatestPollAverage(state) {
	const latestClinton =  await Pollaverages.find({
		where: {
			state: state,
			candidatename: 'Clinton',
		},
		order: [
			['date', 'DESC']
		],
		raw: true
	});

	const latestTrump =  await Pollaverages.find({
		where: {
			state: state,
			candidatename: 'Trump',
		},
		order: [
			['date', 'DESC']
		],
		raw: true
	});	

	return { Clinton: latestClinton.pollaverage, Trump: latestTrump.pollaverage };
}

module.exports = getLatestPollAverage;