var	db = require('../models/index'),
	Polldata = require('../models/index').Polldata;

// runs a psql query to get data from db
export default (state) =>
	Polldata.findAll({ where: { state }, order: [['endDate', 'ASC']], raw: true });
