const	db = require('../models/index');
const lastupdates = require('../models/index').lastupdates;

// runs a psql query to get data from db
export default function getLastUpdated() {
	return lastupdates.findOne({
		raw: true,
	}).then(function(data) {
		return data.lastupdate;
	});
}
