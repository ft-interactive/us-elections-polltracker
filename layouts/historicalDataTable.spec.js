/**
 * Unit tests for historicalDataTable.js
 */

import chai from 'chai';
chai.should();

import getHistoricalResults, {
  getCandidatesList,
  getFederalWinners,
  getStateWinners,
  getBarExtents,
} from './historicalDataTable';

const FAKE_STATE_DEMOGRAPHICS_DATA = {
  label: {
    outcome1: 'Candidate1 (DEM)',
    loser1: 'Candidate2 (GOP)',
    margin1: 1,
    outcome2: 'Candidate2 (GOP)',
    loser2: 'Candidate1 (DEM)',
    margin2: -2,
    outcome3: 'Candidate2 (GOP)',
    loser3: 'Candidate1 (DEM)',
    margin3: -3,
    outcome4: 'Candidate1 (DEM)',
    loser4: 'Candidate2 (GOP)',
    margin4: 4,
    outcome5: 'Candidate1 (DEM)',
    loser5: 'Candidate2 (GOP)',
    margin5: 5,
  },
  AA: {
    outcome1: -1,
    outcome2: 2,
    outcome3: -3,
    outcome4: 4,
    outcome5: -5,
  },
  BB: {
    outcome1: 6,
    outcome2: -7,
    outcome3: 8,
    outcome4: -9,
    outcome5: 10,
  },
  CC: {
    outcome1: -11,
    outcome2: 12,
    outcome3: -13,
    outcome4: 14,
    outcome5: -15,
  },
  DD: {
    outcome1: 16,
    outcome2: -17,
    outcome3: 18,
    outcome4: -19,
    outcome5: 20,
  },
};

describe('getCandidatesList', () => {
  const candidates = getCandidatesList(FAKE_STATE_DEMOGRAPHICS_DATA);

  it('should create an object keyed by outcome${year}', () => {
    candidates.should.have.keys([
      'outcome1',
      'outcome2',
      'outcome3',
      'outcome4',
      'outcome5',
    ]);
  });

  it('should list "Candidate1" as "dem" and "Candidate2" as "gop"', () => {
    candidates.outcome1.should.have.keys(['dem', 'gop']);
    candidates.outcome1.dem.should.equal('Candidate1');
    candidates.outcome1.gop.should.equal('Candidate2');

    candidates.outcome2.should.have.keys(['dem', 'gop']);
    candidates.outcome2.dem.should.equal('Candidate1');
    candidates.outcome2.gop.should.equal('Candidate2');

    candidates.outcome3.should.have.keys(['dem', 'gop']);
    candidates.outcome3.dem.should.equal('Candidate1');
    candidates.outcome3.gop.should.equal('Candidate2');

    candidates.outcome4.should.have.keys(['dem', 'gop']);
    candidates.outcome4.dem.should.equal('Candidate1');
    candidates.outcome4.gop.should.equal('Candidate2');

    candidates.outcome5.should.have.keys(['dem', 'gop']);
    candidates.outcome5.dem.should.equal('Candidate1');
    candidates.outcome5.gop.should.equal('Candidate2');
  });
});

describe('getFederalWinners', () => {
  const winners = getFederalWinners(FAKE_STATE_DEMOGRAPHICS_DATA);

  it('should return an array of federal winners in rev chrono', () => {
    winners.should.be.instanceof(Array);
    winners.should.deep.equal([
      'Candidate1 (DEM)',
      'Candidate1 (DEM)',
      'Candidate2 (GOP)',
      'Candidate2 (GOP)',
      'Candidate1 (DEM)',
    ]);
  });
});

describe('getStateWinners', () => {
  const TEST_CANDIDATES = getCandidatesList(FAKE_STATE_DEMOGRAPHICS_DATA);

  it('should return an array of state winners for "AA"', () => {
    const TEST_STATE = 'AA';
    const winners = getStateWinners(
      FAKE_STATE_DEMOGRAPHICS_DATA,
      TEST_STATE,
      TEST_CANDIDATES
    );

    winners.should.be.instanceof(Array);
    winners.should.deep.equal([
      'Candidate2',
      'Candidate1',
      'Candidate2',
      'Candidate1',
      'Candidate2',
    ]);
  });

  it('should return an array of state winners for "BB"', () => {
    const TEST_STATE = 'BB';
    const winners = getStateWinners(
      FAKE_STATE_DEMOGRAPHICS_DATA,
      TEST_STATE,
      TEST_CANDIDATES
    );

    winners.should.be.instanceof(Array);
    winners.should.deep.equal([
      'Candidate1',
      'Candidate2',
      'Candidate1',
      'Candidate2',
      'Candidate1',
    ]);
  });

  it('should return an array of state winners for "CC"', () => {
    const TEST_STATE = 'CC';
    const winners = getStateWinners(
      FAKE_STATE_DEMOGRAPHICS_DATA,
      TEST_STATE,
      TEST_CANDIDATES
    );

    winners.should.be.instanceof(Array);
    winners.should.deep.equal([
      'Candidate2',
      'Candidate1',
      'Candidate2',
      'Candidate1',
      'Candidate2',
    ]);
  });

  it('should return an array of state winners for "DD"', () => {
    const TEST_STATE = 'DD';
    const winners = getStateWinners(
      FAKE_STATE_DEMOGRAPHICS_DATA,
      TEST_STATE,
      TEST_CANDIDATES
    );

    winners.should.be.instanceof(Array);
    winners.should.deep.equal([
      'Candidate1',
      'Candidate2',
      'Candidate1',
      'Candidate2',
      'Candidate1',
    ]);
  });
});

describe('getBarExtents', () => {
  const extents = getBarExtents(FAKE_STATE_DEMOGRAPHICS_DATA);
  it('should return an array of the absolute highest and lowest values', () => {
    extents.should.be.instanceof(Array);
    extents.should.deep.equal([1, 20]);
  });
});

describe('default function (getHistoricalResults)', () => {
  it('should return an array of results for "AA"', () => {
    const TEST_STATE = 'AA';
    const result = getHistoricalResults(FAKE_STATE_DEMOGRAPHICS_DATA, TEST_STATE);
    result.should.deep.equal([
      { year: '5',
        winningPctScaledState: 16.184210526315788,
        winningPctState: 500,
        stateWinnerColor: 'gop',
        winnerState: 'Candidate2',
        winningPctScaledFederal: 16.184210526315788,
        winningPctFederal: 500,
        federalWinnerColor: 'dem',
        winnerFederal: 'Candidate1' },
      { year: '4',
        winningPctScaledState: 12.26315789473684,
        winningPctState: 400,
        stateWinnerColor: 'dem',
        winnerState: 'Candidate1',
        winningPctScaledFederal: 12.26315789473684,
        winningPctFederal: 400,
        federalWinnerColor: 'dem',
        winnerFederal: 'Candidate1' },
      { year: '3',
        winningPctScaledState: 8.342105263157894,
        winningPctState: 300,
        stateWinnerColor: 'gop',
        winnerState: 'Candidate2',
        winningPctScaledFederal: 8.342105263157894,
        winningPctFederal: 300,
        federalWinnerColor: 'gop',
        winnerFederal: 'Candidate2' },
      { year: '2',
        winningPctScaledState: 4.421052631578947,
        winningPctState: 200,
        stateWinnerColor: 'dem',
        winnerState: 'Candidate1',
        winningPctScaledFederal: 4.421052631578947,
        winningPctFederal: 200,
        federalWinnerColor: 'gop',
        winnerFederal: 'Candidate2' },
      { year: '1',
        winningPctScaledState: 0.5,
        winningPctState: 100,
        stateWinnerColor: 'gop',
        winnerState: 'Candidate2',
        winningPctScaledFederal: 0.5,
        winningPctFederal: 100,
        federalWinnerColor: 'dem',
        winnerFederal: 'Candidate1' },
    ]);
  });
});
