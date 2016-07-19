var	db = require('../models/index'),
	Polldata = require('../models/index').Polldata;

// runs a psql query to get data from db
async function getAllPolls(state) {
	return Polldata.findAll({
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