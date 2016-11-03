import createResultPage from '../pages/createResultPage';
import { render } from '../nunjucks';
import cache from '../lib/cache';
import { getResultData } from '../lib/results';

const maxAge = 10;
const sMaxAge = 5;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export async function page(req, res) {
  res.setHeader('Cache-Control', cacheControl);
  try {
    const html = await cache(
      'result-html',
      async () => render('result.html', await createResultPage())
    );
    res.send(html);
  } catch(err) {
    console.error(err);
    res.status(500).send('Error');
  }
}

export async function fullResults(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  try {
    const data = await getResultData();
    // TODO: etag is update timestamp
    res.json(data.resultsPage);
  } catch(err) {
    console.error(err);
    res.status(500).send({message:'Error fetching election data'});
  }
}

export async function homepageResults(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  try {
    const data = await getResultData();
    // TODO: etag is update timestamp
    res.json(data.homepage);
  } catch(err) {
    console.error(err);
    res.status(500).send({message:'Error fetching election data'});
  }
}
