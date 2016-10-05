import Page from './page';

class NationalPage extends Page {
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
    await this.pready();
  }
}

export default async () => {
  const page = new NationalPage();
  await page.ready();
  return page;
};