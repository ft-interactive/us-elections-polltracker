import moment from 'moment';
import flags from '../../config/flags';
import * as polls from '../lib/polls.js';
import siteNav from '../lib/site-nav';
import db from '../../models';
import axios from 'axios';
import cache from '../lib/cache';

const lastUpdated = () =>
  db.lastupdates.findOne({ raw: true }).then(data => data && new Date(data.lastupdate));

const fetchSuggestedReads = ({list, limit = 10}) =>
  cache(
    `suggestedReads:${list}:${limit}`,
    () => axios.get(`https://ig.ft.com/onwardjourney/v1/${list}/json/?limit=${limit}`, { timeout: 3000 }).then(response => response.data),
    3 * 60 * 1000 // 3 mins
  );

const onwardJourney = () => ({

  suggestedReads: {
    list: 'list/721e37c6-7442-11e6-bf48-b372cdb1043a',
    limit: 4,
  },

  relatedContent: [

    // "US Election 2016" stream
    { rows: 1, list: 'thing/N2UxNTM3MzItNWNlZC00MDc5LWI3ODUtYWNmZDA2YjE0MWE2-U2VjdGlvbnM=' },

    // Hightlights (curated list)
    { rows: 1, list: 'list/highlights' },
  ],
});

const ads = {
  site: 'world',
  zone: 'us.and.canada',
  aboveHeader: true,
};

export default class Page {

  id = null;

  headline = null;

  summary = null;

  title = 'US election polls 2016';

  description = 'Polling data for the 2016 US presidential election';

  socialHeadline = 'US presidential election: here\'s where the polls stand';

  socialSummary = 'US election poll tracker: Here\'s who\'s ahead';

  url = 'https://ig.ft.com/us-elections/';

  constructor() {
    this.canoniclUrl = 'https://ig.ft.com/us-elections/polls/';
    this.mainImage = {
      url: 'https://ig.ft.com/us-elections/images/social.jpg',
    };
    this.flags = flags();
    this.onwardJourney = onwardJourney();
    this.onwardJourney.suggestedReads.data = [];


    this.siteNav = siteNav();

    const electionDay = moment('2016-11-08');
    const todayDay = moment();
    this.daysToElection = electionDay.diff(todayDay, 'days');
  }

  async pready() {
    this.publishedDate = await lastUpdated();
    this.pollHistory = await polls.pollHistory(this.code);
    try {
      this.onwardJourney.suggestedReads.data = await fetchSuggestedReads(this.onwardJourney.suggestedReads);
    } catch(e) {
      console.error('Failed to get onward journey inset links', e.message);
      // swallow error. if we cant get the onward journey suggestedReads links
      // no need to fail to render the page
    }
  }

  tracking = {
    micrositeName: 'us-elections',
    googleAnalyticsPropertyID: 'UA-35229645-7',
  };

  topic = {
    name: 'US Election 2016',
    url: 'https://www.ft.com/us-election-2016',
  };

  ads = ads;
}

// const getLatestPollAverage = require('./layouts/getLatestPollAverage.js');
// const latestPollAverages = await getLatestPollAverage(state);

// let shareTitle = `US presidential election polls: Here’s where ${stateName} stands now`;
// if (latestPollAverages) {
//   if (state === 'us') {
//     shareTitle = `US presidential election polls: It's Clinton ${latestPollAverages.Clinton}%, Trump ${latestPollAverages.Trump}%`;
//   } else {
//     shareTitle = `US presidential election polls: In ${stateName}, it's Clinton ${latestPollAverages.Clinton}%, Trump ${latestPollAverages.Trump}%`;
//   }
// }
