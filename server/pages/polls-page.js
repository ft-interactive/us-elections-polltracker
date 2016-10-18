import Page from './page';
import db from '../../models';
import siteNav from '../lib/site-nav';
import * as polls from '../lib/polls.js';

const lastUpdated = () =>
  db.lastupdates.findOne({ raw: true }).then(data => data && new Date(data.lastupdate));

export default class PollsPage extends Page {

  title = 'US election polls 2016';

  description = 'Polling data for the 2016 US presidential election';

  socialHeadline = 'US presidential election: here\'s where the polls stand';

  socialSummary = 'US election poll tracker: Here\'s who\'s ahead';

  constructor() {
    super();
    this.mainImage = {
      url: 'https://ig.ft.com/us-elections/images/social.jpg',
    };
    this.siteNav = siteNav();
  }

  async pready() {
    this.publishedDate = await lastUpdated();
    this.pollHistory = await polls.pollHistory(this.code);
  }
}
