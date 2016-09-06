import cache from '../lib/cache';
import { render } from '../nunjucks';
import nationalCount from '../lib/national-count';

const maxAge = 120;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);
  const count = await nationalCount();
  const html = await cache(
    'ec-forecast-component',
    async () => render('ec-forecast-component.html', {title:'how many electoral college votes are up for grabs?', data:count})
  );
  res.send(html);
};
