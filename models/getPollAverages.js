const db = require('./index');
const _ = require('underscore');
const d3 = require('d3');

const deleteTimezoneOffset = d3.timeFormat('%B %e, %Y');

// runs a psql query to get data from db
async function getPollAverages(state, startDate, endDate) {
	return db.Pollaverages.findAll({
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
	})
	.then(function(data) {
		data = _.each(data, function(row) {
			row.date = new Date(deleteTimezoneOffset(row.date));
		});
		return data;
	});
}

module.exports = getPollAverages;