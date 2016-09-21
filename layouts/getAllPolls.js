var	db = require('../models/index'),
	Polldata = require('../models/index').Polldata;

// runs a psql query to get data from db
export default (state, pollnumcandidates) =>
	Polldata.findAll({ where: { state, pollnumcandidates }, order: [['endDate', 'ASC']], raw: true });
