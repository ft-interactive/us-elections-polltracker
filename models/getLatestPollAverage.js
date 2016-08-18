const db = require('./index');
const d3 = require('d3');

const deleteTimezoneOffset = d3.timeFormat('%B %e, %Y');

// runs a psql query to get data from db
async function getLatestPollAverage(state) {
	const latestClinton =  await db.Pollaverages.find({
		where: {
			state: state,
			candidatename: 'Clinton',
		},
		order: [
			['date', 'DESC']
		],
		raw: true
	});

	const latestTrump =  await db.Pollaverages.find({
		where: {
			state: state,
			candidatename: 'Trump',
		},
		order: [
			['date', 'DESC']
		],
		raw: true
	});	

	if (latestClinton && latestTrump) {
		return { Clinton: latestClinton.pollaverage, Trump: latestTrump.pollaverage };
	}
	return false;
}

module.exports = getLatestPollAverage;