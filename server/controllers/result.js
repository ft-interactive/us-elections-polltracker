import createResultPage from '../pages/createResultPage';
import { render } from '../nunjucks';
import cache from '../lib/cache';
import { getResultData } from '../lib/results';

const maxAge = 10;
const sMaxAge = 5;

export async function page(req, res) {
  res.setHeader('Cache-Control', `public, max-age=30, s-maxage=10`);
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
  res.setHeader('Cache-Control', `public, max-age=10, s-maxage=5`);
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
  res.setHeader('Cache-Control', `public, max-age=10, s-maxage=5`);
  try {
    const data = await getResultData();
    // TODO: etag is update timestamp
    res.json(data.homepage);
  } catch(err) {
    console.error(err);
    res.status(500).send({message:'Error fetching election data'});
  }
}
