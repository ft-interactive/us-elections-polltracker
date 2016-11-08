import fs from 'fs';
import color from '../../../layouts/color';

// If a tab doesn't appear in this list then it's an unknown tab name
// If a tab does appear in this list but it's value is false
// then it should never display regardless of whatever the spreadsheet says
const knownTabs = Object.freeze({
  president: true,
  house: true,
  senate: true,
  markets: true,
});

const defaultTabConfig = Object.freeze(['president', 'house', 'senate', 'markets']);

const defaults =  Object.freeze({
  refreshAfter: 10000,
  switchTabEvery: 5000,
  enabledPanels: defaultTabConfig,
  resultsPromoEnabled: false,
  marketcharts: 'night',
  showPolltracker: false,
});

const marketdataChartGroups = {
  night: true,
}

export function createHomepageConfig(spreadsheetConfig) {

  // make a copy of the defaults object
  const config = {
    ...defaults,
    footnote: spreadsheetConfig.footnote,
  };

  if (typeof spreadsheetConfig.resultsPromoEnabled === 'boolean') {
    config.resultsPromoEnabled = spreadsheetConfig.resultsPromoEnabled;
  }

  if (typeof spreadsheetConfig.showPolltracker === 'boolean') {
    config.showPolltracker = spreadsheetConfig.showPolltracker;
  }

  if (spreadsheetConfig.marketcharts &&
      marketdataChartGroups[spreadsheetConfig.marketcharts.toLowerCase()]) {
    config.marketcharts = spreadsheetConfig.marketcharts.toLowerCase();
  }

  if (spreadsheetConfig.homepagePanels) {
    const input = spreadsheetConfig.homepagePanels.toString().toLowerCase();

    // An empty cell in the spreadsheet should not mean "no panels"
    // We must be explicit about wanting that, so weprefer special code: "none"
    if (input === 'none') {
      config.enabledPanels = [];

    // To show the panels to be whatever the default is then use "auto"
    } else if (input === 'auto') {
      config.enabledPanels = defaultTabConfig;
    }

    const arr = input.split(/[\s,]+/g).map(val => {
      let _val = val.trim();
      return _val && knownTabs[_val] ? _val : null;
    }).filter(Boolean);

    if (arr.length) {
      config.enabledPanels = arr;
    }
  }

  if (spreadsheetConfig.refreshAfter) {
    // Dont let the poll rate go under 1 sec
    if (spreadsheetConfig.refreshAfter >= 1000) {
      config.refreshAfter = spreadsheetConfig.refreshAfter;
    } else {
      config.refreshAfter = null;
    }
  }

  // Dont let the HP tab switching go under 3 secs
  if (spreadsheetConfig.switchTabEvery >= 3000) {
    config.switchTabEvery = spreadsheetConfig.switchTabEvery;
  }

  return config;
}

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
