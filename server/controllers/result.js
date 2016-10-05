import createResultPage from '../pages/createResultPage';
import { render } from '../nunjucks';
import cache from '../lib/cache';

const maxAge = 30;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);

  const html = await cache(
    'result',
    async () => render('result.html', await createResultPage())
  );

  res.send(html);
};
