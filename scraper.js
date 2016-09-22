import fetch from 'isomorphic-fetch';
import winston from 'winston';
import db from './models';
import stateIds from './data/states';
import nationalId from './data/national';

// db.Pollaverages.sync({force: true}) // use this to drop table and recreate
db.sequelize.sync();

const addPollAveragesToDatabase = (polldate, candidate, value, state, pollnumcandidates) => {
  db.sequelize.transaction(async () => {
    const res = await db.Pollaverages.findAll({
      where: {
        date: polldate,
        candidatename: candidate,
        state,
        pollnumcandidates,
      },
    });

    if (res.length > 0) { // already in the db
      // check to make sure value hasn't changed
      if (res[0].dataValues.pollaverage !== parseFloat(value)) {
        db.Pollaverages.update({ pollaverage: value }, {
          where: {
            id: res[0].dataValues.id,
          },
        });

        winston.log('warn', `RCP value for ${candidate} on ${polldate} changed from ${res[0].dataValues.pollaverage} to ${value} in state ${state} (${pollnumcandidates}-way)`);
      }
    } else {
      await db.Pollaverages.create({ date: polldate, candidatename: candidate, pollaverage: value, state, pollnumcandidates });

      winston.log('info', `New poll average added for ${candidate} on ${polldate} with value ${value} in state ${state} (${pollnumcandidates}-way)`);
    }
  });
};

const getPollAverageData = async (rcpURL, state, pollnumcandidates) => {
  const rcpData = fetch(rcpURL).then(res => res.json());

  const datapoints = rcpData.rcp_avg;

  for (let i = 0; i < datapoints.length; i += 1) {
    const datapoint = datapoints[i];
    const polldate = datapoint.date;

    for (let j = 0; j < datapoint.candidate.length; j += 1) {
      const candidate = datapoint.candidate[j].name;
      const value = datapoint.candidate[j].value;

      addPollAveragesToDatabase(polldate, candidate, value, state, pollnumcandidates);
    }
  }
};

const addIndividualPollsToDatabase = (rcpid, type, pollster, rcpUpdated, link, date, startDate, endDate, confidenceInterval, sampleSize, marginError, partisan, pollsterType, candidate, value, state, pollnumcandidates) => {
  db.sequelize.transaction(async () => {
    const res = db.Polldata.findAll({
      where: {
        rcpid,
        candidatename: candidate,
        state,
        pollnumcandidates,
      },
    });

    if (res.length > 0) { // already in the db
      // check to make sure value hasn't changed
      if (res[0].dataValues.pollvalue !== parseFloat(value)) {
        db.Polldata.update({ pollvalue: value }, {
          where: {
            id: res[0].dataValues.id,
          },
        });

        winston.log('warn', `RCP value for ${candidate} with id ${rcpid} changed from ${res[0].dataValues.pollvalue} to ${value} in state ${state} (${pollnumcandidates}-way)`);
      }
    } else {
      await db.Polldata.create({ rcpid, pollster, rcpUpdated, link, date, startDate, endDate, confidenceInterval, sampleSize, marginError, partisan, pollsterType, candidatename: candidate, pollvalue: value, state, pollnumcandidates });

      winston.log('info', `New individual poll added for ${candidate} with id ${rcpid} and pollster ${pollster} with value ${value} in state ${state} (${pollnumcandidates}-way)`);
    }
  });
};

function getIndividualPollData(rcpURL, state, pollnumcandidates) {
  fetch(rcpURL).then(response => {
    response.json().then(rcpData => {
      const polls = rcpData.poll;
      for (let i = 0; i < polls.length; i += 1) {
        if (polls[i].type !== 'rcp_average') { // exclude poll averages
          const poll = polls[i];

          const {
            type, pollster, link, date, confidenceInterval, sampleSize,
            marginError, partisan,
            pollster_type: pollsterType,
            data_start_date: startDate,
            data_end_date: endDate,
            updated: rcpUpdated,
            id: rcpid,
          } = poll;

          for (let j = 0; j < poll.candidate.length; j += 1) {
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
  db.sequelize.transaction(async () => {
    const res = await db.lastupdates.findAll({});

    if (res.length > 0) { // already in the db
      db.lastupdates.update({ lastupdate: new Date() }, {
        where: {
          id: res[0].dataValues.id,
        },
      });
    } else {
      db.lastupdates.create({ lastupdate: new Date() });
    }
  });
}

const allIds = stateIds.concat(nationalId);

for (let i = 0; i < allIds.length; i += 1) {
  const state = allIds[i].code.toLowerCase();
  const raceId = allIds[i].raceId;
  const raceId3Way = allIds[i].raceId3Way;
  const raceId4Way = allIds[i].raceId4Way;

  if (raceId) {
    getPollAverageData(
      `http://www.realclearpolitics.com/poll/race/${raceId}/historical_data.json`,
      state,
      2
    );

    getIndividualPollData(
      `http://www.realclearpolitics.com/poll/race/${raceId}/polling_data.json`,
      state,
      2
    );
  }

  if (raceId3Way) {
    getPollAverageData(
      `http://www.realclearpolitics.com/poll/race/${raceId3Way}/historical_data.json`,
      state,
      3
    );

    getIndividualPollData(
      `http://www.realclearpolitics.com/poll/race/${raceId3Way}/polling_data.json`,
      state,
      3
    );
  }

  if (raceId4Way) {
    getPollAverageData(
      `http://www.realclearpolitics.com/poll/race/${raceId4Way}/historical_data.json`,
      state,
      4
    );

    getIndividualPollData(
      `http://www.realclearpolitics.com/poll/race/${raceId4Way}/polling_data.json`,
      state,
      4
    );
  }
}

updateLastUpdatedDate();
