import stateReference from '../../data/states';
import { getStateDemographics } from './demographics';

const states = stateReference.map(d => {
  const demographics = getStateDemographics(d.code);
  let fullname = d.name;
  if (d.subdivision) {
    fullname = `${d.name} (District ${d.subdivision})`;
  }
  if (d.children) {
    fullname = `${d.name} (statewide)`;
  }
  return { ...d, fullname, demographics };
});

export const slugIndex = states.reduce((map, state) =>
        map.set(state.slug, state), new Map());

const codeIndex = states.reduce((map, state) =>
        map.set(state.code, state.slug), new Map());

export function codeToSlug(code) {
  if (!code) return null;
  return codeIndex.get(code.toUpperCase());
}

export function getBySlug(slug) {
  return slugIndex.get(slug);
}

export function isState(slug) {
  return slugIndex.has(slug);
}

export function getByCode(code) {
  const slug = codeToSlug(code);
  if (!slug) return null;
  return getBySlug(slug);
}

export function getByContentId(id) {
  return states.find(state => state.id === id);
}

export function getAllCodes() {
  return codeIndex.keys();
}

export function getSimpleList() {
  return states.map(state => ({
    slug: state.slug,
    name: state.name,
    fullname: state.fullname,
    ecVotes: state.ecVotes,
    code: state.code,
  }));
}

const codeNameIndex = states.reduce((map, state) =>
        map.set(state.code, state.name), new Map());

export function codeToName(code) {
  if (!code) return null;
  return codeNameIndex.get(code.toUpperCase());
}
