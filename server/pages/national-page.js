import Page from './page';

export default class NationalPage extends Page {
  constructor() {
    super();
    this.headline = 'US election poll tracker';
    this.nationalBarCounts = {
      dem: 221,
      leaningDem: 50,
      swing: 50,
      leaningRep: 10,
      rep: 207,
    };
  }
}
