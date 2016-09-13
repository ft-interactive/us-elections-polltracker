import stateReference from '../data/states';
import _ from 'lodash';

// if the state has a parent, return sibling state (congressional district) information
export default function layout(state) {
  let districtList = [];

  if ('parent' in state) {
    districtList = _.filter(stateReference, { parent: state.parent });
  }

  return districtList;
}
