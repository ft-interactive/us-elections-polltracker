import Page from './page';
import { getEditorsConfig } from '../lib/editors-config';
import getStateCounts from '../lib/state-counts';
import layoutForecastMap from '../../layouts/forecast-map-layout';
import nationalCount from '../lib/national-count';

class NationalPage extends Page {
  constructor() {
    super();
    this.headline = 'US election poll tracker';
    this.streamUrl = 'https://www.ft.com/us-election-2016';
    this.url = 'https://ig.ft.com/us-elections/polls';
    this.code = 'us';
    this.id = 'e01abff0-5292-11e6-9664-e0bdc13c3bef';
  }

  async ready() {
    await this.pready();
    const stateCounts = await getStateCounts();
    let editorsConfig;

    try {
      editorsConfig = await getEditorsConfig();
    } catch(e) {
      // Fail gracefully if we have trouble getting data from the Bertha sheet
      // Ideally let the template provide default values for things.
      // If we need some default calculations do them here...
      console.log('Error getting editors config');
      editorsConfig = new Map();
    }

    this.latestNews = editorsConfig.get('text');
    const copyUpdated = new Date(editorsConfig.get('updated') || 0);

    if (copyUpdated > this.publishedDate) {
      this.publishedDate = copyUpdated;
    }

    this.stateCounts = stateCounts;
    this.nationalBarCounts = await nationalCount(stateCounts);
    this.forecastMapLayout = layoutForecastMap(
      stateCounts,
      { size: '640x380' }
    );
  }
}

export async function createPage() {
  const page = new NationalPage();
  await page.ready();
  return page;
}

// TODO: with polls `US presidential election polls: It's Clinton ${latestPollAverages.Clinton}%, Trump ${latestPollAverages.Trump}%`
// TODO: no polls `US presidential election polls: Here’s where ${stateName} stands now`
