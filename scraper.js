const fetch = require('isomorphic-fetch');
const winston = require('winston');
const db = require('./models/index');
const Polldata = require('./models/index').Polldata;

// Polldata.sync({force: true}) // use this to drop table and recreate
db.sequelize.sync();

function addPollAveragesToDatabase(polldate, candidate, value, state) {
  Polldata.findAll({
    where: {
      date: polldate,
      candidatename: candidate,
      state: state,
    },
  }).then(function(res) {
    if (res.length > 0) { // already in the db
      // check to make sure value hasn't changed
      if (res[0].dataValues.pollaverage !== parseFloat(value)) {
        Polldata.update({
          pollaverage: value,
        }, {
          where: {
            id: res[0].dataValues.id,
          },
        });
        winston.log('warn', 'RCP value for '+candidate+' on '+polldate+' changed from '+res[0].dataValues.pollaverage+' to '+value)
      }
    } else {
      Polldata.create({ date: polldate, candidatename: candidate, pollaverage: value, state: state }).then(function(poll) {
        winston.log('info', 'New poll average added for '+candidate+' on '+polldate+' with value '+value);
      });
    }
  });
}

function getPollAverageData(rcpURL) {
  fetch(rcpURL).then(function(response) {
    response.json().then(function(rcpData) {
      const datapoints = rcpData.rcp_avg;
      for (let i = 0; i < datapoints.length; i++) {
        const datapoint = datapoints[i];
        const polldate = datapoint.date;
        for (let j = 0; j < datapoint.candidate.length; j++) {
          const candidate = datapoint.candidate[j].name;
          const value = datapoint.candidate[j].value;
          const state = 'us';

          addPollAveragesToDatabase(polldate, candidate, value, state);
        }
      }
    });
  });
}

const raceId = '5491';
getPollAverageData(`http://www.realclearpolitics.com/poll/race/${raceId}/historical_data.json`);
