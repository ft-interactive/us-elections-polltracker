import color from './color';

// returns an appropriate [bgColor, textColor] for a given winner
const getColors = (winner) => {
  if (!winner) return [color.pinkTint2, '#000'];

  switch (winner.toLowerCase()) {
    case 'd':
      return [color.Clinton, '#fff'];
    case 'r':
      return [color.Trump, '#fff'];
    case 'ind':
      return [color.McMullin, '#fff'];
    case 'grn':
      return [color.Stein, '#fff'];
    case 'lib':
      return [color.Johnson, '#000'];
    default:
      console.warn(`Unexpected winner code: ${winner}`);
      return [color.pinkTint2, '#000'];
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
        const [bgColor, textColor] = getColors(state.winner);
        const [, code, districtNumber] = /([A-Za-z]+)([0-9]*)/.exec(state.code.toUpperCase());
        const winner = state.winner ? state.winner.toLowerCase() : null;

        return {
          code, // e.g. "ME" or "NY"
          districtNumber, // e.g. "2" (for maine/nebraska) or "" (most cases)
          winner,
          bgColor,
          textColor,
        };
      })
    ;
  }

  return rvp;
};
