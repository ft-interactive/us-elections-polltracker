import PollsPage from './polls-page';
import { getEditorsConfig } from '../lib/editors-config';
import getStateCounts from '../lib/state-counts';
import layoutForecastMap from '../../layouts/forecast-map-layout';
import layoutECBreakdown from '../../layouts/ec-breakdown-layout';
import nationalCount from '../lib/national-count';
import onwardJourney from '../lib/onwardjourney';

class NationalPage extends PollsPage {

  id = 'e01abff0-5292-11e6-9664-e0bdc13c3bef';

  headline = 'Trump vs Clinton: who is leading in the US election polls?';

  url = 'https://ig.ft.com/us-elections/polls';

  // TODO: what's this for?
  code = 'us';

  constructor() {
    super();
  }

  async ready() {
    await this.pready();
    const stateCounts = await getStateCounts();
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
    this.onwardJourney = await onwardJourney({
      // Home page US Election midriff
      suggestedReads: 'list/721e37c6-7442-11e6-bf48-b372cdb1043a',
      relatedContent: [
        // "US Election 2016" stream
        'thing/N2UxNTM3MzItNWNlZC00MDc5LWI3ODUtYWNmZDA2YjE0MWE2-U2VjdGlvbnM=',
        // Home page Highlights section
        'list/highlights'
      ]
    });
    this.nationalBarCounts = await nationalCount(stateCounts);
    this.ecBreakdownLayout = layoutECBreakdown(stateCounts);
    this.forecastMapLayout = layoutForecastMap(
      stateCounts,
      { size: '640x380' }
    );
  }
}

export default async () => {
  const page = new NationalPage();
  await page.ready();
  return page;
};

// TODO: with polls `US presidential election polls: It's Clinton ${latestPollAverages.Clinton}%, Trump ${latestPollAverages.Trump}%`
// TODO: no polls `US presidential election polls: Here’s where ${stateName} stands now`
