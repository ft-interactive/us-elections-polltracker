import moment from 'moment';
import flags from '../../config/flags';
import lastUpdated from '../../layouts/getLastUpdated';
import * as polls from '../lib/polls.js';
import siteNav from '../lib/site-nav';

const onwardJourney = () => ({
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
    this.siteNav = siteNav();

    const electionDay = moment('2016-11-08');
    const todayDay = moment();
    this.daysToElection = electionDay.diff(todayDay, 'days');
  }

  async pready() {
    this.publishedDate = new Date(await lastUpdated());
    this.pollHistory = await polls.pollHistory(this.code);
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
