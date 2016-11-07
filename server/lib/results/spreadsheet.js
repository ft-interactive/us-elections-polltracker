import debug from 'debug';
import axios from 'axios';
import { sanitiseInteger, percentOfVotes } from './util';

const log = debug('results:spreadsheet');

const sheetId = process.env.RESULTS_SHEET || '1gJT-zp6KNLZzx7qmdqBkcCmFJHngwa1lBELufORFFik';

const allSheets = [
  'copy',
  'electoralCollege',
  'congress',
  'media'
];

const berthaUrl = (id, sheets, endpoint) =>
          `https://bertha.ig.ft.com/${endpoint}/publish/gss/${sheetId}/${sheets.join(',')}?exp=0`;

const viewUrl = berthaUrl(sheetId, allSheets, 'view');

const republishUrl = berthaUrl(sheetId, allSheets, 'republish');

export function fetchAllSheets() {
  log(viewUrl);
  return axios.get(viewUrl);
}

export function republishAllSheets() {
  log(republishUrl);
  return axios.get(republishUrl);
}
