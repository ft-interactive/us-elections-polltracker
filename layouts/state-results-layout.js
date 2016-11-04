import color from './color';
import states from '../data/states.json';

// returns an appropriate [bgColor, textColor] for a given winner
const getColors = (winner) => {
  if (!winner) return [color.pinkTint2, '#000'];

  switch (winner.toLowerCase()) {
    case 'd':
      return [color.Clinton, '#fff'];
    case 'r':
      return [color.Trump, '#fff'];
    default:
      return [color.McMullin, '#000'];
  }
};

const bucketIds = ['D', 'LD', 'T', 'LR', 'R'];

export default (electoralCollege) => {
  const rvp = {
    buckets: {},
  };

  for (const bucketId of bucketIds) {
    rvp.buckets[bucketId] = electoralCollege
      .filter(state => state.pollingprojection.toUpperCase() === bucketId)
      .map(state => {
        console.log('\n\nstate\n', state);

        const { ecvotes: ecVotes } = state;
        const [bgColor, textColor] = getColors(state.winner);
        const [, code, districtNumber] = /([A-Za-z]+)([0-9]*)/.exec(state.code.toUpperCase());
        const winner = state.winner ? state.winner.toLowerCase() : null;

        const shortName = code; // TODO

        const ecVotesWidth = (ecVotes / 55) * 100; // top number of EC votes is 55 (Calif.)

        return {
          ecVotes,
          ecVotesWidth,
          code, // e.g. "ME" or "NY"
          districtNumber, // e.g. "2" (for maine/nebraska) or "" (most cases)
          shortName,
          winner,
          bgColor,
          textColor,
        };
      })
    ;
  }

  return rvp;
};
