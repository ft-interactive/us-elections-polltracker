"use strict";
const fetch = require('isomorphic-fetch');
const winston = require('winston');
const db = require('./models/index');
const Pollaverages = require('./models/index').Pollaverages;
const Polldata = require('./models/index').Polldata;
const lastupdates = require('./models/index').lastupdates;
const stateIds = require('./layouts/stateIds').states;

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
        winston.log('warn', 'RCP value for '+candidate+' on '+polldate+' changed from '+res[0].dataValues.pollaverage+' to '+value + ' in state ' + state);
      }
    } else {
      Pollaverages.create({ date: polldate, candidatename: candidate, pollaverage: value, state: state }).then(function(poll) {
        winston.log('info', 'New poll average added for '+candidate+' on '+polldate+' with value '+value + ' in state ' + state);
      });
    }
  });
}

function getPollAverageData(rcpURL, state) {
  fetch(rcpURL).then(function(response) {
    response.json().then(function(rcpData) {
      const datapoints = rcpData.rcp_avg;
      for (let i = 0; i < datapoints.length; i++) {
        const datapoint = datapoints[i];
        const polldate = datapoint.date;
        for (let j = 0; j < datapoint.candidate.length; j++) {
          const candidate = datapoint.candidate[j].name;
          const value = datapoint.candidate[j].value;

          addPollAveragesToDatabase(polldate, candidate, value, state);
        }
      }
    });
  });
}

function addIndividualPollsToDatabase(rcpid, type, pollster, rcpUpdated, link, date, startDate, endDate, confidenceInterval, sampleSize, marginError, partisan, pollsterType, candidate, value, state) {
  Polldata.findAll({
    where: {
      rcpid: rcpid,
      candidatename: candidate,
      state: state,
    },
  }).then(function(res) {
    if (res.length > 0) { // already in the db
      // check to make sure value hasn't changed
      if (res[0].dataValues.pollvalue !== parseFloat(value)) {
        Polldata.update({
          pollvalue: value
        }, {
          where: {
            id: res[0].dataValues.id
          },
        });
        winston.log('warn', 'RCP value for '+candidate+' with id '+rcpid+' changed from '+res[0].dataValues.pollvalue+' to '+value + ' in state ' + state);
      }
    } else {
      Polldata.create({ rcpid: rcpid, pollster: pollster, rcpUpdated: rcpUpdated, link: link, date: date, startDate: startDate, endDate: endDate, confidenceInterval: confidenceInterval, sampleSize: sampleSize, marginError: marginError, partisan: partisan, pollsterType: pollsterType, candidatename: candidate, pollvalue: value, state: state }).then(function(poll) {
        winston.log('info', 'New individual poll added for '+candidate+' with id '+rcpid+' and pollster '+pollster+' with value '+value + ' in state ' + state);
      });
    }
  });
}

function getIndividualPollData(rcpURL, state) {
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
            addIndividualPollsToDatabase(rcpid, type, pollster, rcpUpdated, link, date, startDate, endDate, confidenceInterval, sampleSize, marginError, partisan, pollsterType, candidate, value, state);
          }
        }
      }
    });
  });
}

function updateLastUpdatedDate() {
  lastupdates.findAll({
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
}


for (let i = 0; i < stateIds.length; i++) {
  const state = stateIds[i].state.toLowerCase();
  const raceId = stateIds[i].raceId;

  if (raceId) {
    getPollAverageData(`http://www.realclearpolitics.com/poll/race/${raceId}/historical_data.json`, state);
    getIndividualPollData(`http://www.realclearpolitics.com/poll/race/${raceId}/polling_data.json`, state);
  }
}
updateLastUpdatedDate();
