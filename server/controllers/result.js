import createResultPage from '../pages/createResultPage';
import { render } from '../nunjucks';
import cache from '../lib/cache';
import { getResultData } from '../lib/results';

const maxAge = 10;
const sMaxAge = 5;

// IMPORTANT: this experiment hardcodes the polyfill service URL.
// If we change the URL by altering its feature or flags then we also need to update it here too.
const linkHeader = [
                    '<g-ui/critical.css>; as="style"; rel="preload"; nopush',
                    '<g-ui/main.css>; as="style"; rel="preload"; nopush',
                    '<main.css>; as="style"; rel="preload"; nopush',
                    '<g-ui/top.js>; as="script"; rel="preload"; nopush',
                    '<https://cdn.polyfill.io/v2/polyfill.min.js?callback=igPolyfillsLoaded&features=default-3.6,matchMedia,fetch,IntersectionObserver,HTMLPictureElement,Map|always|gated,Array.from|always|gated,Array.prototype.includes|always|gated&flags=gated&unknown=polyfill>; as="script"; rel="preload"; nopush'
                  ].join(', ');

export async function page(req, res) {
  res.setHeader('Cache-Control', `public, max-age=30, s-maxage=10`);
  res.setHeader('Link', linkHeader);
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
