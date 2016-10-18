import createResultPage from '../pages/createResultPage';
import { render } from '../nunjucks';
import cache from '../lib/cache';

import getResultData from '../lib/getResultData';

const maxAge = 10;
const sMaxAge = 5;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export async function page (req, res) {
  res.setHeader('Cache-Control', cacheControl);
  const html = await cache(
    'result-html',
    async () => render('result.html', await createResultPage())
  );
  res.send(html);
};

export async function fullResults(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  res.json(await getResultData());
}

export async function resultOverview(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  res.json((await getResultData()).overview);
}
