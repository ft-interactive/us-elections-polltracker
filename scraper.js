"use strict";
const fetch = require('isomorphic-fetch');
const winston = require('winston');
const db = require('./models/index');
const Pollaverages = require('./models/index').Pollaverages;
const Polldata = require('./models/index').Polldata;
const lastupdates = require('./models/index').lastupdates;
const stateIds = require('./data/states');
const nationalId = require('./data/national');

// Pollaverages.sync({force: true}) // use this to drop table and recreate
db.sequelize.sync();

function addPollAveragesToDatabase(polldate, candidate, value, state, pollnumcandidates) {
  db.sequelize.transaction(function (t1) {
    return Pollaverages.findAll({
      where: {
        date: polldate,
        candidatename: candidate,
        state,
        pollnumcandidates,
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
          winston.log('warn', `RCP value for ${candidate} on ${polldate} changed from ${res[0].dataValues.pollaverage} to ${value} in state ${state} (${pollnumcandidates}-way)`);
        }
      } else {
        Pollaverages.create({ date: polldate, candidatename: candidate, pollaverage: value, state, pollnumcandidates }).then(function(poll) {
          winston.log('info', `New poll average added for ${candidate} on ${polldate} with value ${value} in state ${state} (${pollnumcandidates}-way)`);
        });
      }
    });
  });
}

function getPollAverageData(rcpURL, state, pollnumcandidates) {
  fetch(rcpURL).then(function(response) {
    response.json().then(function(rcpData) {
      const datapoints = rcpData.rcp_avg;
      for (let i = 0; i < datapoints.length; i++) {
        const datapoint = datapoints[i];
        const polldate = datapoint.date;
        for (let j = 0; j < datapoint.candidate.length; j++) {
          const candidate = datapoint.candidate[j].name;
          const value = datapoint.candidate[j].value;

          addPollAveragesToDatabase(polldate, candidate, value, state, pollnumcandidates);
        }
      }
    });
  });
}

function addIndividualPollsToDatabase(rcpid, type, pollster, rcpUpdated, link, date, startDate, endDate, confidenceInterval, sampleSize, marginError, partisan, pollsterType, candidate, value, state, pollnumcandidates) {
  db.sequelize.transaction(function (t2) {
    return Polldata.findAll({
      where: {
        rcpid,
        candidatename: candidate,
        state,
        pollnumcandidates,
      },
    }).then(function(res) {
      if (res.length > 0) { // already in the db
        // check to make sure value hasn't changed
        if (res[0].dataValues.pollvalue !== parseFloat(value)) {
          Polldata.update({
            pollvalue: value,
          }, {
            where: {
              id: res[0].dataValues.id,
            },
          });
          winston.log('warn', `RCP value for ${candidate} with id ${rcpid} changed from ${res[0].dataValues.pollvalue} to ${value} in state ${state} (${pollnumcandidates}-way)`);
        }
      } else {
        Polldata.create({ rcpid, pollster, rcpUpdated, link, date, startDate, endDate, confidenceInterval, sampleSize, marginError, partisan, pollsterType, candidatename: candidate, pollvalue: value, state, pollnumcandidates }).then(function(poll) {
          winston.log('info', `New individual poll added for ${candidate} with id ${rcpid} and pollster ${pollster} with value ${value} in state ${state} (${pollnumcandidates}-way)`);
        });
      }
    });
  });
}

function getIndividualPollData(rcpURL, state, pollnumcandidates) {
  fetch(rcpURL).then((response) => {
    response.json().then((rcpData) => {
      const polls = rcpData.poll;
      for (let i = 0; i < polls.length; i++) {
        if (polls[i].type !== 'rcp_average') { // exclude poll averages
          const poll = polls[i];
          const rcpid = poll.id;
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
            addIndividualPollsToDatabase(rcpid, type, pollster, rcpUpdated, link, date, startDate, endDate, confidenceInterval, sampleSize, marginError, partisan, pollsterType, candidate, value, state, pollnumcandidates);
          }
        }
      }
    });
  });
}

function updateLastUpdatedDate() {
  db.sequelize.transaction(function (t3) {
    return lastupdates.findAll({
    }).then((res) => {
      if (res.length > 0) { // already in the db
        lastupdates.update({
          lastupdate: new Date(),
        }, {
          where: {
            id: res[0].dataValues.id,
          },
        });
      } else {
        lastupdates.create({ lastupdate: new Date() });
      }
    });
  });
}


const allIds = stateIds.concat(nationalId);

for (let i = 0; i < allIds.length; i++) {
  const state = allIds[i].code.toLowerCase();
  const raceId = allIds[i].raceId;
  const raceId4Way = allIds[i].raceId4Way;

  if (raceId) {
    getPollAverageData(`http://www.realclearpolitics.com/poll/race/${raceId}/historical_data.json`, state, 2);
    getIndividualPollData(`http://www.realclearpolitics.com/poll/race/${raceId}/polling_data.json`, state, 2);
  }

  if (raceId4Way) {
    getPollAverageData(`http://www.realclearpolitics.com/poll/race/${raceId4Way}/historical_data.json`, state, 4);
    getIndividualPollData(`http://www.realclearpolitics.com/poll/race/${raceId4Way}/polling_data.json`, state, 4);
  }
}

updateLastUpdatedDate();
