import lru from 'lru-cache';

export default lru({
  max: 500,
  maxAge: 60 * 1000, // 60 seconds
});
