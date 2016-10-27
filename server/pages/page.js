import moment from 'moment';
import flags from '../../config/flags';

const ads = {
  site: 'world',
  zone: 'us.and.canada',
  aboveHeader: true,
};

export default class Page {

  id = null;

  headline = null;

  summary = null;

  title = 'US election';

  description = null;

  socialHeadline = null;

  socialSummary = null;

  url = 'https://ig.ft.com/us-elections/';

  electionDay = moment('2016-11-08');

  tracking = {
    micrositeName: 'us-elections',
    googleAnalyticsPropertyID: 'UA-35229645-7',
  };

  topic = {
    name: 'US Election 2016',
    url: 'https://www.ft.com/us-election-2016',
  };

  subspromo = {
    header: {
      href: 'https://sub.ft.com/spa_uselection/?segmentId=b0cc72ef-a788-b64a-8860-bbd7e9713d62&utm_source=election&utm_medium=onsite_link&utm_campaign=2016_Q4_US_Election_poll_page',
      text: 'Limited time offer: Try the FT for 3 months'
    }
  };

  ads = ads;

  constructor() {
    this.flags = flags();
    const todayDay = moment();
    this.daysToElection = this.electionDay.diff(todayDay, 'days');
  }
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
