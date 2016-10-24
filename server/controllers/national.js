import createNationalPage from '../pages/createNationalPage';
import { render } from '../nunjucks';
import cache from '../lib/cache';

const maxAge = 180; // 3 mins
const sMaxAge = 60; // 1 min
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);

  const html = await cache(
    'nationalpolls',
    async () => render('national.html', await createNationalPage()),
    maxAge * 1000 // 3 mins
  );

  res.send(html);
};
