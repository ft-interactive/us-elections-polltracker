const db = require('./index');
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
		return data.map(function(row) {	
			const copy = Object.assign({}, row);
			copy.date = new Date(deleteTimezoneOffset(row.date));
			return copy;
		});
	});
}

module.exports = getPollAverages;
