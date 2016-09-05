import { getBySlug, getSimpleList } from './states';

export default function siteNav() {
  return {
    keyBattlegroundStates: [
      getBySlug('arizona'),
      getBySlug('florida'),
      getBySlug('georgia'),
      getBySlug('iowa'),
      getBySlug('missouri'),
      getBySlug('nevada'),
      getBySlug('north-carolina'),
      getBySlug('ohio'),
      getBySlug('pennsylvania'),
      getBySlug('wisconsin'),
    ],
    allStates: getSimpleList(),
  };
}
