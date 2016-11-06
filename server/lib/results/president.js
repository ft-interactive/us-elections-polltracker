import { cleanWinnerCode } from './electoral-college';
import { percentOfVotes, maxPolities, maxVotes } from './util';
import color from '../../../layouts/color';

function sumECVotes(array, accessor) {
  return array.reduce((totals, current) => {
    const winner = accessor(current);
    if (winner == null) return totals;
    totals[winner] += current.ecvotes;
    return totals;
  }, { r: 0, d: 0, g: 0, l: 0, i: 0 });
}

export function presidentialElectionResult(states) {

  const {r: trump, d: clinton, l: libertarian, g: green, i: independent} = sumECVotes(states, d => d.winner);
  const {r: bestGuessTrump, d: bestGuessClinton} = sumECVotes(states, d => d.winner || cleanWinnerCode(d.liveestimate));
  const other = libertarian + green + independent;
  const numVotes = trump + clinton + other;

  // TODO: is this correct? Nebraska and Maine appear twice in spreadsheet?
  const numComplete = states.filter(d => d.winner).length;
  const numIncomplete = (maxPolities - numComplete);
  const isFinal = numIncomplete === 0;
  let hasMajority = false;
  let winningCandidate = null;
  let winningParty = null;

  if (trump >= 270) {
    hasMajority = true;
    winningCandidate = 'Trump';
    winningParty = 'R';
  } else if (clinton >= 270) {
    hasMajority = true;
    winningCandidate = 'Clinton';
    winningParty = 'D';
  }

  if (numVotes > maxVotes) throw new Error('Too many electoral college votes');
  if (numComplete > maxPolities) throw new Error('Too many states or polities');

  return {
    clinton,
    trump,
    other,

    clinton_pct: percentOfVotes(clinton),
    trump_pct: percentOfVotes(trump),
    other_pct: percentOfVotes(other),

    bestGuessClinton,
    bestGuessTrump,
    bestGuessClinton_pct: percentOfVotes(bestGuessClinton),
    bestGuessTrump_pct: percentOfVotes(bestGuessTrump),

    numVotes,
    numComplete,
    numIncomplete,
    isFinal,
    hasMajority,
    winningCandidate,

    // TODO: remove references of this
    states_reporting: numComplete,

    // detail about others
    libertarian,
    green,
    independent,
    libertarian_pct: percentOfVotes(libertarian),
    green_pct: percentOfVotes(green),
    independent_pct: percentOfVotes(independent),
  }
}
