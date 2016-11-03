import {percent, sanitiseInteger} from './util';


function createResult({
              total = 0,
              demInitial = 0, repInitial = 0, indInitial = 0,
              demLast = 0, repLast = 0, indLast = 0,
              rep = 0, dem = 0, ind = 0} = {}) {

  // TODO: ensure results dont exceed the possible total ie Sentate results add up to 100
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
    // total amount of senators
    total: 100,

    // Not all seats are up for reelection. This is what
    // we definately know about the new composition of the Senate
    repInitial: 30, demInitial: 34, indInitial: 2,

    // The composition of the Senate before the 2016 election
    repLast: 54, demLast: 44, indLast: 2,

    rep: sanitiseInteger(rep, 'Senate Rep field error'),
    dem: sanitiseInteger(dem, 'Senate Dem field error'),
    ind: sanitiseInteger(ind, 'Senate Ind field error')
  });
}

export function houseResults(rep = 0, dem = 0, ind = 0) {
  return createResult({
    // total amount of congressman
    total: 435,

    // All the house is up for re-election. Everything starts at zero
    repInitial: 0, demInitial: 0, indInitial: 0,

    // The composition of the House of reps before the 2016 election
    repLast: 247, demLast: 186, indLast: 0,

    rep: sanitiseInteger(rep, 'House Rep field error'),
    dem: sanitiseInteger(dem, 'House Dem field error'),
    ind: sanitiseInteger(ind, 'House Ind field error')
  });
}
