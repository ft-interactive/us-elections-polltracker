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
      url: 'https://image.webservices.ft.com/v1/images/raw/https:%2F%2Fig.ft.com%2Fstatic%2Fus-election-2016%2Fsocial.jpg?source=ig&format=jpg&quality=medium&width=800',
    };
    this.siteNav = siteNav();
  }

  async pready() {
    this.publishedDate = await lastUpdated();
    this.pollHistory = await polls.pollHistory(this.code);
  }
}
