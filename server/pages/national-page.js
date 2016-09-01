import Page from './page';
import { getEditorsConfig } from '../lib/editors-config';
import getBerthaData from '../lib/getBerthaData';
import getStateCounts from '../lib/getStateCounts';
import layoutForecastMap from '../../layouts/forecast-map-layout';
import nationalCount from '../lib/national-count';

class NationalPage extends Page {
  constructor() {
    super();
    this.headline = 'US election poll tracker';
    this.streamUrl = 'https://www.ft.com/us-election-2016';
    this.url = this.url + '/polls';
    this.code = 'us';
  }

  async ready() {
    await this.pready();
    const stateCounts = await getStateCounts(await getBerthaData());
    this.stateCounts = stateCounts;
    this.nationalBarCounts = await nationalCount(stateCounts);
    this.forecastMapLayout = layoutForecastMap(
      stateCounts,
      { size: '640x380' }
    );
  }
}

export async function createPage() {
  const editorsConfig = await getEditorsConfig();
  const page = new NationalPage();
  await page.ready();
  page.latestNews = editorsConfig.get('text');

  const copyUpdated = new Date(editorsConfig.get('updated') || 0);

  if (copyUpdated > page.publishedDate) {
    page.publishedDate = copyUpdated;
  }

  return page;
}

// TODO: with polls `US presidential election polls: It's Clinton ${latestPollAverages.Clinton}%, Trump ${latestPollAverages.Trump}%`
// TODO: no polls `US presidential election polls: Here’s where ${stateName} stands now`
