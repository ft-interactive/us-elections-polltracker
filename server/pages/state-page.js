import Page from './page';
import { getBySlug } from '../lib/states';
import referenceData from '../../layouts/stateDemographics';
import historicalDataTable from '../../layouts/historicalDataTable';
import demographicBarcode from '../../layouts/demographicBarcode';

class StatePage extends Page {
  constructor(state) {
    super();
    this.state = state;
    this.id = this.state.id;
    this.code = this.state.code;
    this.headline = `US election poll tracker: ${this.state.name}`;
    this.url = `${this.url}/${this.state.slug}-polls`;
    this.streamUrl = this.state.url || (this.state.conceptId ? `https://www.ft.com/stream/regionsId/${this.conceptId}` : null);

    if (this.state.conceptId) {
      this.onwardJourney.relatedContent = this.onwardJourney.relatedContent.slice();
      this.onwardJourney.relatedContent.splice(1, 0, {
        rows: 1,
        list: `thing/${this.state.conceptId}`,
      });
    }

    this.historicalResults = historicalDataTable(referenceData, state.code);
    this.demographicIndicators = this.state.demographics.map(d => demographicBarcode(d));
  }

  async ready() {
    await this.pready();
  }
}

export async function createPage(slug) {
  const state = getBySlug(slug);

  if (!state) return null;

  const page = new StatePage(state);

  await page.ready();

  return page;
}
