const lastupdates = require('../models/index').lastupdates;

// runs a psql query to get data from db
export default () =>
	lastupdates.findOne({ raw: true }).then(data => data.lastupdate);
