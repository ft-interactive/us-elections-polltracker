import * as polls from '../lib/polls.js';
import { getByCode } from '../lib/states';

const setHeaders = res => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, max-age=600`);
};

const startOfPolls = '2015-07-01T00:00:00Z';
const aDateAfterTheElection = '2016-11-08T00:00:00Z';
const defaultNumCandidates = 4;

export const state = async(req, res) => {
  const code = req.params.state.toLowerCase();
  const pollnumcandidates = Number.isInteger(parseInt(req.query.pollnumcandidates)) && parseInt(req.query.pollnumcandidates);
  let numCandidates;

  if (code === 'us') {
    numCandidates = pollnumcandidates;
  } else {
    const state = getByCode(code);
    if (!state) {
      res.sendStatus(404);
      return
    }
    numCandidates = pollnumcandidates || state.displayRace;
  }

  setHeaders(res);
  res.json(await polls.pollAverages(
    startOfPolls,
    aDateAfterTheElection,
    code,
    numCandidates || defaultNumCandidates
  ));
}
