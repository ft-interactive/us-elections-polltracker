var _ = require('underscore'),
	db = require('../models/index'),
	Pollaverages = require('../models/index').Pollaverages;

// runs a psql query to get data from db
async function getPollAverages(state, startDate, endDate) {
	return Pollaverages.findAll({
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
	});
}

module.exports = getPollAverages;