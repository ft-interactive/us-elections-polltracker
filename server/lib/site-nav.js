import { getBySlug, getSimpleList } from './states';

export default function siteNav() {
  const allStates = getSimpleList();

  // then exclude congressional districts
  const allStatesMinusCD = allStates.filter(stateObj => stateObj.code.indexOf('CD') <= -1);

  return {
    keyBattlegroundStates: [
      getBySlug('arizona'),
      getBySlug('colorado'),
      getBySlug('florida'),
      getBySlug('georgia'),
      getBySlug('iowa'),
      getBySlug('missouri'),
      getBySlug('nevada'),
      getBySlug('new-hampshire'),
      getBySlug('north-carolina'),
      getBySlug('ohio'),
      getBySlug('pennsylvania'),
      getBySlug('virginia'),
    ],
    allStates: allStatesMinusCD,
  };
}
