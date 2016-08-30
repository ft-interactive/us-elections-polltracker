import _ from 'lodash';
import Page from './page';
import * as stateReference from '../../layouts/stateIds';
// _.findWhere(stateIds, { 'state': state.toUpperCase() }).stateName

const index = stateReference.states.reduce((m, state) =>
      m.set(_.kebabCase(state.stateName), state), new Map());

const codeToSlugLookup = stateReference.states.reduce((m, state) =>
      m.set(state.state, _.kebabCase(state.stateName)), new Map());

class StatePage extends Page {
  constructor(config) {
    super();
    this.headline = `This is the state page for ${config.stateName}`;
  }
}

export function codeToSlug(code) {
  const uppered = code.toUpperCase();
  if (!codeToSlugLookup.has(uppered)) return null;
  return codeToSlugLookup.get(uppered);
}

export function getBySlug(slug) {
  if (!index.has(slug)) return null;
  const info = index.get(slug);
  return new StatePage(info);
}
