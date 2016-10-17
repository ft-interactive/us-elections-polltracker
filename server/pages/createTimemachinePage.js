import moment from 'moment';
import Page from './page';
import { getEditorsConfig } from '../lib/editors-config';
import getStateCounts from '../lib/state-counts';
import layoutForecastMap from '../../layouts/forecast-map-layout';
import layoutECBreakdown from '../../layouts/ec-breakdown-layout';
import nationalCount from '../lib/national-count';

class TimemachinePage extends Page {
  constructor(timeMachineDate) {
    super();
    this.headline = 'Presidential election poll tracker';
    this.streamUrl = 'https://www.ft.com/us-election-2016';
    this.url = 'https://ig.ft.com/us-elections/polls';
    this.code = 'us';
    this.id = 'e01abff0-5292-11e6-9664-e0bdc13c3bef';
    this.timeMachineDate = timeMachineDate ? moment(timeMachineDate).hour(23).minutes(59) : new Date();
    this.timeMachineDateString = moment(timeMachineDate).format('MMMM D, YYYY');
  }

  async ready() {
    await this.pready();
    const stateCounts = await getStateCounts(this.timeMachineDate);
    let editorsConfig;

    try {
      editorsConfig = await getEditorsConfig();
    } catch (e) {
      // Fail gracefully if we have trouble getting data from the Bertha sheet
      // Ideally let the template provide default values for things.
      // If we need some default calculations do them here...
      console.error('Error getting editors config');
      editorsConfig = new Map();
    }

    this.latestNews = editorsConfig.get('text');
    const copyUpdated = new Date(editorsConfig.get('updated') || 0);

    if (copyUpdated > this.publishedDate) {
      this.publishedDate = copyUpdated;
    }

    this.stateCounts = stateCounts;
    this.nationalBarCounts = await nationalCount(stateCounts);
    this.ecBreakdownLayout = layoutECBreakdown(stateCounts);
    this.forecastMapLayout = layoutForecastMap(
      stateCounts,
      { size: '640x380' }
    );
  }
}

export default async (timeMachineDate) => {
  const page = new TimemachinePage(timeMachineDate);
  await page.ready();
  return page;
};

// TODO: with polls `US presidential election polls: It's Clinton ${latestPollAverages.Clinton}%, Trump ${latestPollAverages.Trump}%`
// TODO: no polls `US presidential election polls: Here’s where ${stateName} stands now`
