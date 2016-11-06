import fs from 'fs';
import color from '../../../layouts/color';

// TODO: stop doing any results stuff if
// TODO: what to do with "isFinal"? how does it affect the front end
// TODO: Automatically write the footnote or substitute variables
// TODO: how to print the time in the footnote for all locales. safe HTML with o-date
// TODO: decide sensible defaults for everything
// TODO: validate all values coming from Bertha config


// If a tab doesn't appear in this list then it's an unknown tab name
// If a tab does appear in this list but it's value is false
// then it should never display regardless of whatever the spreadsheet says
const knownTabs = {
  president: true,
  house: true,
  senate: true,
  markets: true,
};

const defaultTabConfig = ['president', 'house', 'senate'];

/* TODO:
what about states without a winner yet?
swing: '#fcc83c',
nodata: '#b0b0b0',
nomapdata: '#b0b0b0',
ftpink: '#fff1e0',
border: '#dadada',
land: '#fff',
*/
const winnerColors = {
  R: '#f12c49',
  D: '#0094cb',
  IND: color.McMullin,
  I: color.McMullin,
  L: color.McMullin,
  LIB: color.McMullin,
  GRN: color.McMullin,
  G: color.McMullin,
}

export function mapStateFills(states) {
  return states.filter(state => !!state && state.winner && !!state.code).reduce((map, state) => {
    map[state.code.toUpperCase()] = winnerColors[state.winner.toUpperCase()];
    return map;
  }, {});
}
