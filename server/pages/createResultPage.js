import Page from './page';
import getResult from '../lib/getResultData';
import dotMapLayout from '../../layouts/results-dot-map'; 
import mapLayout from '../../layouts/results-map'; 
import color from '../../layouts/color';

class ResultPage extends Page {
  constructor() {
    super();
    this.title = 'Presidential election result';
    this.streamUrl = 'https://www.ft.com/us-election-2016';
    this.url = 'https://ig.ft.com/us-elections/result';
    this.code = 'us';
    this.id = '';
  }

  async ready() {
    const result = await getResult(); 
    this.headline = result.copy.headline;
    this.subtitle = result.copy.subtitle;
    this.stateResults = result.electoralCollege;
    this.overview = result.overview;
    this.mediaOrgs = result.mediaOrgs;
    this.color = color;
    this.dotMapSelectors = dotMapLayout( result.electoralCollege, { width: 800, height: 500 } );
    this.mapSelectors = mapLayout( result.electoralCollege, { width: 800, height: 500 } );
    this.ecBarLayout = 'EC Bar Layout!';
    this.senateBarLayout = 'Senate Bar Layout!';
    this.houseBarLayout = 'House Bar Layout!';

    await this.pready();
  }
}

export default async () => {
  const page = new ResultPage();

  await page.ready();
  return page;
};
