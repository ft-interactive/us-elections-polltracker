import NationalPage from '../pages/national-page';
import { render } from '../nunjucks';

export default async (req, res) => {
  const page = new NationalPage();

  await page.ready();

  res.send(render('national.html', page));
};
