var	db = require('../models/index'),
	lastupdates = require('../models/index').lastupdates;

// runs a psql query to get data from db
async function getLastUpdated() {
	return lastupdates.findOne({
		raw: true,
	}).then(function(data) {
		return data.lastupdate;
	});
}

module.exports = getLastUpdated;