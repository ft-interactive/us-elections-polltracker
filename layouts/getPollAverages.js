var	db = require('../models/index'),
	_ = require('underscore'),
	d3 = require('d3'),
	moment = require('moment'),
	Pollaverages = require('../models/index').Pollaverages;

const deleteTimezoneOffset = d3.timeFormat('%B %e, %Y');

// runs a psql query to get data from db
async function getPollAverages(state, startDate, endDate, pollnumcandidates) {
	// to capture data from anytime during the day (and timezone offsets), set endDate
	// to the start of the next day
	endDate = moment(endDate).add(1, 'day').format();

	return Pollaverages.findAll({
		where: {
			state: state,
			date: {
				$gte: startDate,
				$lte: endDate,
			},
			pollnumcandidates,
		},
		order: [
			['date', 'ASC']
		],
		raw: true
	})
	.then(function(data) {
		data = _.each(data, function(row) {
			row.date = new Date(deleteTimezoneOffset(row.date));
		});
		return data;
	});
}

module.exports = getPollAverages;