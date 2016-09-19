var db = require('../models/index'),
  _ = require('underscore'),
  d3 = require('d3'),
  Pollaverages = require('../models/index').Pollaverages;

// runs a psql query to get data from db
async function getLatestPollAverage(state, pollnumcandidates) {
  const latestClinton = await Pollaverages.find({
    where: {
      state,
      candidatename: 'Clinton',
      pollnumcandidates,
    },
    order: [
      ['date', 'DESC'],
    ],
    raw: true,
  });

  const latestTrump = await Pollaverages.find({
    where: {
      state,
      candidatename: 'Trump',
      pollnumcandidates,
    },
    order: [
      ['date', 'DESC'],
    ],
    raw: true,
  });

  const latestJohnson = await Pollaverages.find({
    where: {
      state,
      candidatename: 'Johnson',
      pollnumcandidates,
    },
    order: [
      ['date', 'DESC'],
    ],
    raw: true,
  });

  const latestStein = await Pollaverages.find({
    where: {
      state,
      candidatename: 'Stein',
      pollnumcandidates,
    },
    order: [
      ['date', 'DESC'],
    ],
    raw: true,
  });

  let clintonPoll = null;
  let trumpPoll = null;
  let johnsonPoll = null;
  let steinPoll = null;

  if (latestClinton) {
    clintonPoll = latestClinton.pollaverage;
  }

  if (latestTrump) {
    trumpPoll = latestTrump.pollaverage;
  }

  if (latestJohnson) {
    johnsonPoll = latestJohnson.pollaverage;
  }

  if (latestStein) {
    steinPoll = latestStein.pollaverage;
  }

  return { Clinton: clintonPoll, Trump: trumpPoll, Johnson: johnsonPoll, Stein: steinPoll };
}

module.exports = getLatestPollAverage;
