import Page from './page';
import { getBySlug, getDistricts } from '../lib/states';
import getStateSummary, { getVoteClass, getECVoteScales } from '../lib/getStateSummary';
import referenceData from '../../data/state-demographics';
import historicalDataTable from '../../layouts/historicalDataTable';
import demographicBarcode from '../../layouts/demographicBarcode';
import getStateCounts from '../lib/state-counts';

class StatePage extends Page {
  constructor(state) {
    super();
    this.state = state;
    this.id = this.state.id;
    this.code = this.state.code;
    this.headline = `${this.state.fullname} presidential election polls`;
    this.title = `Latest ${this.state.fullname} polls | US Election 2016 poll tracker`;

    this.url = `https://ig.ft.com/us-elections/${this.state.slug}-polls`;
    this.streamUrl = this.state.url || (this.state.conceptId ? `https://www.ft.com/stream/regionsId/${this.conceptId}` : null);

    if (this.state.conceptId) {
      this.onwardJourney.relatedContent = this.onwardJourney.relatedContent.slice();
      this.onwardJourney.relatedContent.splice(1, 0, {
        rows: 1,
        list: `thing/${this.state.conceptId}`,
      });
    }

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
  }
}

export default async slug => {
  const state = getBySlug(slug);

  if (!state) return null;

  const page = new StatePage(state);

  await page.ready();

  return page;
};
