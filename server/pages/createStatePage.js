import PollsPage from './polls-page';
import { getBySlug, getDistricts } from '../lib/states';
import getStateSummary, { getVoteClass, getECVoteScales } from '../lib/getStateSummary';
import referenceData from '../../data/state-demographics';
import historicalDataTable from '../../layouts/historicalDataTable';
import demographicBarcode from '../../layouts/demographicBarcode';
import getStateCounts from '../lib/state-counts';
import onwardJourney from '../lib/onwardjourney';

class StatePage extends PollsPage {
  constructor(state) {
    super();
    this.state = state;
    this.id = this.state.id;
    this.code = this.state.code;
    this.headline = `${this.state.fullname} presidential election polls`;
    this.title = `Latest ${this.state.fullname} polls | US Election 2016 poll tracker`;
    this.url = `https://ig.ft.com/us-elections/${this.state.slug}-polls`;
    this.historicalResults = historicalDataTable(referenceData, this.state.code);
    this.demographicIndicators = this.state.demographics.map(d => demographicBarcode(d));
    this.districtList = getDistricts(this.code);
    this.state.getVoteClass = getVoteClass;
  }

  async ready() {
    await this.pready();
    this.state.stateCounts = await getStateCounts();
    this.state.ecVoteScale = await getECVoteScales();
    this.summaryData = await getStateSummary(this.state);

    const relatedContent = [
      // "US Election 2016" stream
      'thing/N2UxNTM3MzItNWNlZC00MDc5LWI3ODUtYWNmZDA2YjE0MWE2-U2VjdGlvbnM=',
      // Home page Highlights section
      'list/highlights'
    ];

    if (this.state.conceptId) {
      relatedContent.splice(1, 0, `thing/${this.state.conceptId}`);
    }

    this.onwardJourney = await onwardJourney({
      // Home page US Election headpiece
      suggestedReads: 'list/dbd61736-8af1-11e6-8aa5-f79f5696c731',
      relatedContent
    });
  }
}

export default async slug => {
  const state = getBySlug(slug);

  if (!state) return null;

  const page = new StatePage(state);

  await page.ready();

  return page;
};
