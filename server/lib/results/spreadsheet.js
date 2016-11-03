import debug from 'debug';
import axios from 'axios';
import { sanitiseInteger, percentOfVotes } from './util';

const log = debug('results:spreadsheet');

const sheetId = process.env.RESULTS_SHEET || '17Ea2kjME9yqEUZfQHlPZNc6cqraBUGrxtuHj-ch5Lp4';

const allSheets = [
  'copy',
  'electoralCollege',
  'congress',
  'media'
];

const berthUrl = (id, sheets, endpoint) =>
          `http://bertha.ig.ft.com/${endpoint}/publish/gss/${sheetId}/${sheets.join(',')}?exp=0`;

const viewUrl = berthUrl(sheetId, allSheets, 'view');

const republishUrl = berthUrl(sheetId, allSheets, 'republish');

export function fetchAllSheets() {
  log(viewUrl);
  return axios.get(viewUrl);
}

export function republishAllSheets() {
  log(republishUrl);
  return axios.get(republishUrl);
}
