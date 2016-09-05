import { createPage } from '../pages/national-page';
import { render } from '../nunjucks';
import cache from '../lib/cache';

const maxAge = 120;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);

  const html = await cache(
    'nationalpolls',
    async () => render('national.html', await createPage())
  );

  res.send(html);
};
