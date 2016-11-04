import {percent, sanitiseInteger} from './util';

// total amount of congressman
export const HOUSE_SEATS = 435;

// total amount of senators
export const SENATE_SEATS = 100;

function createResult({
              total = 0,
              demInitial = 0, repInitial = 0, indInitial = 0,
              demLast = 0, repLast = 0, indLast = 0,
              rep = 0, dem = 0, ind = 0} = {}) {

  if ((rep + dem + ind) > total) {
    throw new Error(`Sum of the Rep+Dem+Other seats is more expedcted total of ${total}`);
  }

  return {
    total,
    dem,
    rep,
    ind,
    dem_pct: percent(dem, total),
    rep_pct: percent(rep, total),
    ind_pct: percent(ind, total),
    dem_initial_pct: percent(demInitial, total),
    rep_initial_pct: percent(repInitial, total),
    ind_initial_pct: percent(indInitial, total),
  }
}

export function senateResults(rep = 0, dem = 0, ind = 0) {
  return createResult({
    total: SENATE_SEATS,

    // Not all seats are up for reelection. This is what
    // we definately know about the new composition of the Senate
    repInitial: 30, demInitial: 34, indInitial: 2,

    // The composition of the Senate before the 2016 election
    repLast: 54, demLast: 44, indLast: 2,

    rep: sanitiseInteger(rep, 'Senate Rep field error', true),
    dem: sanitiseInteger(dem, 'Senate Dem field error', true),
    ind: sanitiseInteger(ind, 'Senate Ind field error', true),
  });
}

export function houseResults(rep = 0, dem = 0, ind = 0) {
  return createResult({
    total: HOUSE_SEATS,

    // All the house is up for re-election. Everything starts at zero
    repInitial: 0, demInitial: 0, indInitial: 0,

    // The composition of the House of reps before the 2016 election
    repLast: 247, demLast: 186, indLast: 0,

    rep: sanitiseInteger(rep, 'House Rep field error', true),
    dem: sanitiseInteger(dem, 'House Dem field error', true),
    ind: sanitiseInteger(ind, 'House Ind field error', true),
  });
}
