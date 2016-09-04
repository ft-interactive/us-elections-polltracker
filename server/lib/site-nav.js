import { getSimpleList } from './states';

export default function siteNav() {
  return {
    keyBattlegroundStates: [],
    allStates: getSimpleList(),
  };
}
