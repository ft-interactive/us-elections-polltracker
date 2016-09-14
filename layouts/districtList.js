import stateReference from '../data/states';
import _ from 'lodash';

// if the state has a parent, return sibling state (congressional district) information
export default function layout(state) {
  let districtList = [];

  if ('parent' in state || 'children' in state) {
    const parentCode = state.parent || state.code;
    districtList = districtList.concat(_.filter(stateReference, { code: parentCode })); // add state page
    districtList = districtList.concat(_.filter(stateReference, { parent: parentCode })); // add districts
  }

  return districtList;
}
