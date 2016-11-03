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

const log = debug('results');

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

  // TODO: handle uncaughtPromise errors and log them

  log('Fetch results data')
  return spreadsheet.fetchAllSheets().then(response => {
    log('Process spreadsheet from Bertha');
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

    const copy = processConfigSheet(response.data.copy);
    const electoralCollege = processElectoralCollegeSheet(response.data.electoralCollege);
    const house = senateResults(houseData.rep, houseData.dem, houseData.ind);
    const senate = senateResults(senateData.rep, senateData.dem, senateData.ind);
    const president = presidentialElectionResult(electoralCollege);

    // TODO: add AP row to the beginning is first no matter what
    const mediaOrgs = processMediaSheet(response.data.media);

    const stateFills = mapStateFills(electoralCollege);

    return {
      resultsPage: {
        copy, // TODO: change the name of this property as it's going to contain  more than copy
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
        refreshAfter: 10000, // TODO: spreadsheet config. ensure integer gt a min otherwise set default
        updated: timestamp,
        switchTabEvery: 5000,
        miniDashboard: {
          enabledPanels: [  // TODO: spreadsheet config. lowercase and remove unknown values and duplicates
            'president',
            'house',
            'senate'
          ],
          switchTabEvery: 10000,  // TODO: spreadsheet config. ensure integer gt a min otherwise set to default
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
              dem: senate.dem,
              rep: senate.rep,
              ind: senate.ind,
              dem_contested: 9, // TODO: what's this?
              rep_contested: 20 // TODO: what's this?
            },
            house: {
              dem: house.dem,
              dem_pct: percent(house.dem_pct),
              rep: house.rep,
              rep_pct: percent(house.rep_pct)
            },

            // TODO: allow us to serve this after results service gets turned off
            markets: {
              default: 'https://ig.ft.com/data/us-election/night2-homepage-default.svg',
              S: 'https://ig.ft.com/data/us-election/night2-homepage-small.svg',
              M: 'https://ig.ft.com/data/us-election/night3-homepage-medium.svg',
              L: 'https://ig.ft.com/data/us-election/night2-homepage-large.svg',
              XL: 'https://ig.ft.com/data/us-election/night3-homepage-xlarge.svg'
            }
          }
        },
        resultsPromo: {
          // TODO: simplify the map SVG
          // TODO: can this go through the build service?
          svgUrl: 'https://ig.ft.com/static/us-election-2016/us-state-map-blank.svg',
          stateFills,
        }
      },
    };
  });
}
