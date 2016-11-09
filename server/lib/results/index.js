import debug from 'debug';
import * as spreadsheet from './spreadsheet';
import { senateResults, houseResults } from './congress';
import { presidentialElectionResult, totalECPolities } from './president';
import processMediaSheet from './media';
import processConfigSheet from './config';
import { percent } from './util';
import {processElectoralCollegeSheet} from './electoral-college';
import { mapStateFills, createHomepageConfig } from './homepage';
import cache from '../cache';
import dynamicFootnote from './dynamic-footnote';

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
    const homepageConfig = createHomepageConfig(config);
    const electoralCollege = processElectoralCollegeSheet(response.data.electoralCollege);
    const house = houseResults(houseData.rep, houseData.dem, houseData.ind);
    const senate = senateResults(senateData.rep, senateData.dem, senateData.ind);
    const president = presidentialElectionResult(electoralCollege);

    // Add AP row to the beginning of the Media list for comparison
    const ap = {name: 'Associated Press',
      clinton: president.clinton,
      trump: president.trump,
      other: president.other,
      link: "http://interactives.ap.org/2016/general-election/?SITE=NEWSHOURELN",
    };
    const mediaOrgs = processMediaSheet([ap, ...response.data.media]);

    const stateFills = mapStateFills(electoralCollege);

    const data = {
      lastModified,
      resultsPage: {

        // TODO: change the name of this property as it's going to contain  more than copy
        copy: {
          headline: config.headline,
          subtitle: config.subtitle,
          interstitialtext: config.interstitialtext,
          mapfootnote: dynamicFootnote('**{EC_COMPLETE}** of **538** votes accounted for', lastModified, president, electoralCollege),
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
          pollingInterval: homepageConfig.refreshAfter,
          timestamp,
          senate,
          house,
          president,
        }
      },
      homepage: {
        refreshAfter: homepageConfig.refreshAfter,
        updated: timestamp,
        switchTabEvery: homepageConfig.switchTabEvery,
        showPolltracker: homepageConfig.showPolltracker,
        miniDashboard: {
          enabledPanels: homepageConfig.enabledPanels,
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
              footnote: dynamicFootnote(homepageConfig.footnote, lastModified, president, electoralCollege),
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
              default: `${marketChartBaseUrl}/${homepageConfig.marketcharts}1-homepage-default.svg`,
              S: `${marketChartBaseUrl}/${homepageConfig.marketcharts}2-homepage-small.svg`,
              M: `${marketChartBaseUrl}/${homepageConfig.marketcharts}3-homepage-medium.svg`,
              L: `${marketChartBaseUrl}/${homepageConfig.marketcharts}2-homepage-large.svg`,
              XL: `${marketChartBaseUrl}/${homepageConfig.marketcharts}3-homepage-xlarge.svg`,
            }
          }
        },
        resultsPromo: {
          enabled: homepageConfig.resultsPromoEnabled,
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
