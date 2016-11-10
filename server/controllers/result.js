import createResultPage from '../pages/createResultPage';
import { render } from '../nunjucks';
import cache from '../lib/cache';
import { getResultData, getErrorStatus } from '../lib/results';

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
  res.setHeader('Cache-Control', `public, max-age=120, s-maxage=20`);
  res.setHeader('Link', linkHeader);
  try {
    const html = await cache(
      'result-html',
      async () => render('result.html', await createResultPage()),
      30000 // 30 secs
    );
    res.send(html);
  } catch(err) {
    console.error(err);
    res.status(500).send('Error');
  }
}

export async function socialResultsMap(req, res) {
  res.setHeader('Cache-Control', `public, max-age=30, s-maxage=10`);
  res.setHeader('Link', linkHeader);
  try {
    const html = await cache(
      'social-results-map-html',
      async () => render('social-results-map.html', await createResultPage()),
      60000 // 60 secs
    );
    res.send(html);
  } catch(err) {
    console.error(err);
    res.status(500).send('Error');
  }
}

export async function fullResults(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, max-age=180, s-maxage=30`);
  try {
    const data = await getResultData();
    // res.setHeader('Last-Modified', data.lastModified.toUTCString());
    res.setHeader('Expires', new Date(Date.now() + 1800).toUTCString());
    res.setHeader('ETag', `W/"${data.timestamp}"`);
    res.json(data.resultsPage);
  } catch(err) {
    console.error(err);
    res.status(500).send({message:'Error fetching election data'});
  }
}

export async function homepageResults(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, max-age=180, s-maxage=30`);
  try {
    const data = await getResultData();
    // res.setHeader('Last-Modified', data.lastModified.toUTCString());
    res.setHeader('Expires', new Date(Date.now() + 1800).toUTCString());
    res.setHeader('ETag', `W/"${data.timestamp}"`);
    res.json(data.homepage);
  } catch(err) {
    console.error(err);
    res.status(500).send({message:'Error fetching election data'});
  }
}

export async function serviceStatus(req, res) {
  res.set('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'private, no-cache, max-age=0');
  const message = getErrorStatus();
  res.status(!!message ? 500 : 200);
  res.send(message || 'Ok!');
}

export async function serviceStatusPage(req, res) {
  res.setHeader('Cache-Control', 'private, no-cache, max-age=0');
  const message = getErrorStatus();
  res.status(!!message ? 500 : 200);
  const rate = req.query.rate && !Number.isNaN(Number.parseInt(req.query.rate))
                          ? Number.parseInt(req.query.rate) : 20;
  const m = message || 'OK!';
  const title = !!message ? '😡 ERROR' : '💚 OK';
  const style = !!message ? 'background-color:red;font-size:54px;'
                          : 'background-color:green;text-align:center;font-size:222px;';
  res.send(`<!doctype html><meta charset=utf-8><title>${title}</title>
    <meta http-equiv="refresh" content="${rate}">
    <body style="font-family:sans-serif;;color:white;${style}">
    <p style="font-size:33px;font-family:monospace;margin:0 auto;max-width:800px;">SPREADSHEET STATUS</p>
    <p style="margin:0 auto;max-width:800px;">
    ${m}</p>
  `);
}
