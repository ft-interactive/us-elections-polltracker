const db = require('./index');

// runs a psql query to get data from db
async function getAllPolls(state) {
	return db.Polldata.findAll({
		where: {
			state: state,
		},
		order: [
			['endDate', 'ASC'],
		],
		raw: true,
	});
}

module.exports = getAllPolls;
