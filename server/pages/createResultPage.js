import Page from './page';
import getResult from '../lib/getResultData';

class ResultPage extends Page {
  constructor() {
    super();

    this.title = 'Presidential election result';
    this.headline = 'Presidential election result';
    this.streamUrl = 'https://www.ft.com/us-election-2016';
    this.url = 'https://ig.ft.com/us-elections/result';
    this.code = 'us';
    this.id = '';
  }

  async ready() {
    this.result = await getResult();
    await this.pready();
  }
}

export default async () => {
  const page = new ResultPage();
  await page.ready();
  return page;
};
