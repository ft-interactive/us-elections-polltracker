import cache from '../lib/cache';
import { render } from '../nunjucks';
import stateCount from '../lib/state-counts';
import ecBreakdownLayout from '../../layouts/ec-breakdown-layout';


const maxAge = 120;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);
  const layout = ecBreakdownLayout(await stateCount());

  const html = await cache(
    'ec-breakdown-fontless:' + layout.fontless,
    async () => render('ec-breakdown.html', { layout })
  );

  res.send(html);
};
