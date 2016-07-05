var _ = require('underscore'),
	db = require('../models/index'),
	Polldata = require('../models/index').Polldata;

// runs a psql query to get data from db
async function getPollData(state, startDate, endDate) {
	return Polldata.findAll({
		where: {
			state: state,
			date: {
				$gte: startDate,
				$lte: endDate
			}
		},
		order: [
			['date', 'ASC']
		],
		raw: true
	}).then(function(res) {
		// format response for front end
		return _.groupBy(res, function(row) { return row.candidatename; })
	})
}

module.exports = getPollData;