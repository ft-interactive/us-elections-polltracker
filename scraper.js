var pg = require('pg'),
	fetch = require('isomorphic-fetch'),
	dotenv = require('dotenv');

dotenv.load();

const pgClient = new pg.Client();
var config = {
	user: process.env.PGUSER, //env var: PGUSER
	database: process.env.PGDATABASE, //env var: PGDATABASE
	password: process.env.PGPASSWORD, //env var: PGPASSWORD
	port: 5432, //env var: PGPORT
	max: 10, // max number of clients in the pool
	idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);


function getRCPFeed(rcpURL) {
	fetch(rcpURL).then(function(response) {
		response.json().then(function(rcpData) {
			var datapoints = rcpData.rcp_avg;
			for (var i = 0; i < datapoints.length; i++) {
				var datapoint = datapoints[i],
					polldate = datapoint.date;
				for (var j = 0; j < datapoint.candidate.length; j++) {
					candidate = datapoint.candidate[j].name,
					value = datapoint.candidate[j].value,
					state = 'us';

					console.log(polldate, candidate, value, state)
					
					// pool.query("INSERT INTO pollAverages (polldate, candidateName, value, state) VALUES ('"+polldate+"', '"+candidate+"', "+value+", '"+state+"')").then(function(response) {
					// 	console.log('response', response)
					// })
				}
			}
		})
	})
}

const rcpFeed = `http://www.realclearpolitics.com/poll/race/5491/historical_data.json`;
getRCPFeed(rcpFeed);