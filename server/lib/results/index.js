import debug from 'debug';
import * as spreadsheet from './spreadsheet';
import { senateResults, houseResults } from './congress';
import { presidentialElectionResult, totalECPolities } from './president';
import processMediaSheet from './media';
import processConfigSheet from './config';
import { percent } from './util';
import {processElectoralCollegeSheet} from './electoral-college';
import { mapStateFills } from './homepage';
import cache from '../cache';

const log = debug('results:main');

const marketChartBaseUrl = 'https://ig.ft.com/data/us-election';

let lastErrorStatus;

export function getErrorStatus() {
  return lastErrorStatus;
}

export function getResultData() {
  return cache(
    'results:data',
    fetchSpreadsheetData,
    1000 // TODO: review for production
  );
}

export function dynamicFootnote(template, data, time) {
  // TODO: implement
  const formattedDate = 'TIME'
  return `${data.numComplete} of X states reporting as of ${formattedDate}`;
}

function fetchSpreadsheetData() {
  log('Fetching results data spreadsheet')
  return spreadsheet.fetchAllSheets().then(response => {
    log('Got spreadsheet from Bertha, now process it');
    const lastModified = new Date(response.headers['last-modified']);
    const timestamp = lastModified.getTime();

    if (Number.isNaN(timestamp)) {
      throw new Error('Could not get data modified time');
    }

    const senateData = response.data.congress.find(row => row.type.toLowerCase() === 'senate');
    const houseData = response.data.congress.find(row => row.type.toLowerCase() === 'house');

    // Quick validation of the spreadsheet data to check nothing important is missing
    if (!senateData) throw new Error('No House data available');
    if (!houseData) throw new Error('No Senate data available');
    if (response.data.electoralCollege.length < totalECPolities) throw new Error(`Missing ${totalECPolities - response.data.electoralCollege.length} Electoral college rows`);

    const config = processConfigSheet(response.data.copy);
    const electoralCollege = processElectoralCollegeSheet(response.data.electoralCollege);
    const house = houseResults(houseData.rep, houseData.dem, houseData.ind);
    const senate = senateResults(senateData.rep, senateData.dem, senateData.ind);
    const president = presidentialElectionResult(electoralCollege);

    // TODO: add AP row to the beginning is first no matter what
    const mediaOrgs = processMediaSheet(response.data.media);

    const stateFills = mapStateFills(electoralCollege);

    const data = {
      lastModified,
      resultsPage: {

        // TODO: change the name of this property as it's going to contain  more than copy
        copy: {
          headline: config.headline,
          subtitle: config.subtitle,
          interstitialtext: config.interstitialtext,
          senatefootnote: config.senatefootnote,
          housefootnote: config.housefootnote,
          statebreakdowntitle: config.statebreakdowntitle,
          statebreakdownsubtitle: config.statebreakdownsubtitle,
          congresstext: config.congresstext,
          statetabletext: config.statetabletext,
        },

        mediaOrgs,
        electoralCollege,
        overview: {
          timestamp,
          senate,
          house,
          president,
        }
      },
      homepage: {
        refreshAfter: config.refreshAfter, // TODO: spreadsheet config. ensure integer gt a min otherwise set default
        updated: timestamp,
        switchTabEvery: config.switchTabEvery, // TODO: spreadsheet config. ensure integer gt a min otherwise set to default
        miniDashboard: {
          enabledPanels: config.enabledPanels,
          panelContents: {
            president: {
              clinton: president.clinton,
              trump: president.trump,
              clinton_pct: president.clinton_pct,
              trump_pct: president.trump_pct,
              bestGuessClinton: president.bestGuessClinton,
              bestGuessTrump: president.bestGuessTrump,
              bestGuessClinton_pct: president.bestGuessClinton_pct,
              bestGuessTrump_pct: president.bestGuessTrump_pct,
              footnote: dynamicFootnote('FOO'/* TODO: pass template from spreadsheet*/, president, lastModified),
              isFinal: president.isFinal
            },
            senate: {
              dem: senate.dem_initial,
              rep: senate.rep_initial,
              ind: senate.ind_initial,
              dem_total: senate.dem,
              rep_total: senate.rep,
              ind_total: senate.ind,
              dem_contested: Math.max(0, senate.dem - senate.dem_initial),
              rep_contested: Math.max(0, senate.rep - senate.rep_initial),
              ind_contested: Math.max(0, senate.ind - senate.ind_initial)
            },
            house: {
              dem: house.dem,
              dem_pct: house.dem_pct,
              rep: house.rep,
              rep_pct: house.rep_pct
            },

            // TODO: allow us to serve this after results service gets turned off
            markets: {
              default: `${marketChartBaseUrl}/night1-homepage-default.svg`,
              S: `${marketChartBaseUrl}/night2-homepage-small.svg`,
              M: `${marketChartBaseUrl}/night3-homepage-medium.svg`,
              L: `${marketChartBaseUrl}/night2-homepage-large.svg`,
              XL: `${marketChartBaseUrl}/night3-homepage-xlarge.svg`,
            }
          }
        },
        resultsPromo: {
          enabled: config.resultsPromoEnabled,
          // TODO: simplify the map SVG
          // TODO: can this go through the build service?
          // TODO: does this even get used?
          svgUrl: 'https://ig.ft.com/static/us-election-2016/us-state-map-blank.svg',
          stateFills,
        }
      },
    };
    lastErrorStatus = null;
    log(`Done processing spreadsheet`);
    return data;
  }).catch(err => {
    lastErrorStatus = err.message;
    log('Error processing spreadsheet');
    throw err;
  });
}
