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
			pollnumcandidates: 2,
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
			pollnumcandidates: 2,
		},
		order: [
			['date', 'DESC']
		],
		raw: true
	});	

	if (latestClinton && latestTrump) {
		return { Clinton: latestClinton.pollaverage, Trump: latestTrump.pollaverage };
	}
	return false;
}

module.exports = getLatestPollAverage;