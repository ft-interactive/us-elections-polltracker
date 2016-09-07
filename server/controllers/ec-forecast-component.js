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
  const html = await cache(
    'ec-forecast-component',
    async () => render('ec-forecast-component.html', ecForecastBarsLayout(count))
  );
  if(type === 'json'){
    res.send( { __html: html } );
  }else{
    res.send( html );
  }
};