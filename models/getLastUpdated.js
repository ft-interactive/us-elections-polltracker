const	db = require('./index');

// runs a psql query to get data from db
async function getLastUpdated() {
	return db.lastupdates.findOne({
		raw: true,
	}).then(function(data) {
		return data.lastupdate;
	});
}

module.exports = getLastUpdated;
