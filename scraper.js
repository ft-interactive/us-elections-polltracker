const fetch = require('isomorphic-fetch');
const winston = require('winston');
const db = require('./models/index');
const Pollaverages = require('./models/index').Pollaverages;

// Pollaverages.sync({force: true}) // use this to drop table and recreate
db.sequelize.sync();

function addPollAveragesToDatabase(polldate, candidate, value, state) {
  Pollaverages.findAll({
    where: {
      date: polldate,
      candidatename: candidate,
      state: state,
    },
  }).then(function(res) {
    if (res.length > 0) { // already in the db
      // check to make sure value hasn't changed
      if (res[0].dataValues.pollaverage !== parseFloat(value)) {
        Pollaverages.update({
          pollaverage: value,
        }, {
          where: {
            id: res[0].dataValues.id,
          },
        });
        winston.log('warn', 'RCP value for '+candidate+' on '+polldate+' changed from '+res[0].dataValues.pollaverage+' to '+value)
      }
    } else {
      Pollaverages.create({ date: polldate, candidatename: candidate, pollaverage: value, state: state }).then(function(poll) {
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

function addIndividualPollsToDatabase(id, type, pollster, rcpUpdated, link, date, startDate, endDate, confidenceInterval, sampleSize, marginError, partisan, pollsterType, candidate, value) {
  console.log(id, pollster, candidate, value);
}

function getIndividualPollData(rcpURL) {
  fetch(rcpURL).then((response) => {
    response.json().then((rcpData) => {
      const polls = rcpData.poll;
      for (let i = 0; i < polls.length; i++) {
        const poll = polls[i];
        const id = poll.id;
        const type = poll.type;
        const pollster = poll.pollster;
        const rcpUpdated = poll.updated;
        const link = poll.link;
        const date = poll.date;
        const startDate = poll.data_start_date;
        const endDate = poll.data_end_date;
        const confidenceInterval = poll.confidenceInterval;
        const sampleSize = poll.sampleSize;
        const marginError = poll.marginError;
        const partisan = poll.partisan;
        const pollsterType = poll.pollster_type;
        for (let j = 0; j < poll.candidate.length; j ++) {
          const candidate = poll.candidate[j].name;
          const value = poll.candidate[j].value;
          addIndividualPollsToDatabase(id, type, pollster, rcpUpdated, link, date, startDate, endDate, confidenceInterval, sampleSize, marginError, partisan, pollsterType, candidate, value);
        }
      }
    });
  });
}

const raceId = '5491';
getPollAverageData(`http://www.realclearpolitics.com/poll/race/${raceId}/historical_data.json`);
// getIndividualPollData(`http://www.realclearpolitics.com/poll/race/${raceId}/polling_data.json`);
