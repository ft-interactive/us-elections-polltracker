import cache from '../lib/cache';
import { render } from '../nunjucks';
import nationalCount from '../lib/national-count';
import ecForecastBarsLayout from '../../layouts/ec-forecastbars-layout';

const maxAge = 120;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res, type) => {
  res.setHeader('Cache-Control', cacheControl);
  const count = await nationalCount();
  const layout = { title: 'breakdown', fontless:false, };
  const html = await cache(
    'ec-breakdown-fontless:' + layout.fontless,
    async () => render('ec-breakdown.html', layout)
  );

  res.send(html);
};
