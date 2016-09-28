import stateReference from '../../data/states';
import getStateDemographics from './getStateDemographics';

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

const codeIndex = states.reduce((map, state) =>
        map.set(state.code, state.slug), new Map());

export const slugIndex = states.reduce((map, state) =>
        map.set(state.slug, state), new Map());

const districts = states.filter(state => state.children)
        .map(state => [state, ...states.filter(s => s.parent === state.code)])
        .reduce((map, districts) => {
          districts.forEach(district => map.set(district.code, districts))
          return map;
        }, new Map());

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

export function getDistricts(code) {
  return districts.get(code.toUpperCase()) || [];
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
