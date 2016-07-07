var pg = require('pg'),
	fetch = require('isomorphic-fetch'),
	winston = require('winston'),
	db = require('./models/index'),
	Polldata = require('./models/index').Polldata;

// Polldata.sync({force: true}) // use this to drop table and recreate
db.sequelize.sync();

function getRCPData(rcpURL) {
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

					addToDatabase(polldate, candidate, value, state);
				}
			}
		})
	})
}

function addToDatabase(polldate, candidate, value, state) {	
	Polldata.findAll({
		where: {
			date: polldate,
			candidatename: candidate,
			state: state
		}
	}).then(function(res) {
		if (res.length > 0) { // already in the db
			// check to make sure value hasn't changed
			if (res[0].dataValues.pollaverage != parseFloat(value)) {
				Polldata.update({
					pollaverage: value
				}, {									
					where: {
						id: res[0].dataValues.id
					}
				})
				winston.log('warn', 'RCP value for '+candidate+' on '+polldate+' changed from '+res[0].dataValues.pollaverage+' to '+value)
			}
		} else {
			Polldata.create({ date: polldate, candidatename: candidate, pollaverage: value, state: state }).then(function(poll) {
				winston.log('info', 'New poll average added for '+candidate+' on '+polldate+' with value '+value)
			})
		}
	})
}

const rcpFeed = `http://www.realclearpolitics.com/poll/race/5491/historical_data.json`;
getRCPData(rcpFeed);