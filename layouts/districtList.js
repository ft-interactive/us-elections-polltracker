import stateReference from '../data/states';
import _ from 'lodash';

// if the state has a parent, return sibling state (congressional district) information
export default function layout(state) {
  let districtList = [];

  if ('parent' in state) {
    districtList = districtList.concat(_.filter(stateReference, { code: state.parent })); // add state page
    districtList = districtList.concat(_.filter(stateReference, { parent: state.parent })); // add districts
  }

  return districtList;
}
