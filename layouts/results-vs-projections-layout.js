import color from './color';

const bucketIds = ['D', 'LD', 'T', 'LR', 'R'];

const getColors = (winner) => {
  if (!winner) return { bgColor: color.pinkTint2, textColor: '#000' };

  switch (winner.toLowerCase()) {
    case 'd':
      return { bgColor: color.Clinton, textColor: '#fff' };
    case 'r':
      return { bgColor: color.Trump, textColor: '#fff' };
    case 'ind':
      return { bgColor: color.McMullin, textColor: '#fff' };
    case 'grn':
      return { bgColor: color.Stein, textColor: '#fff' };
    case 'lib':
      return { bgColor: color.Johnson, textColor: '#000' };
    default:
      console.warn(`Unexpected winner code: ${winner}`);
      return { bgColor: color.pinkTint2, textColor: '#000' };
  }
};

export default (electoralCollege) => {
  const rvp = {
    buckets: {},
  };

  for (const bucketId of bucketIds) {
    rvp.buckets[bucketId] = electoralCollege
      .filter(state => state.pollingprojection.toUpperCase() === bucketId)
      .map(state => ({
        code: state.code.toUpperCase(),
        winner: state.winner ? state.winner.toLowerCase() : null,
        ...getColors(state.winner),
      }))
    ;
  }

  return rvp;
};
