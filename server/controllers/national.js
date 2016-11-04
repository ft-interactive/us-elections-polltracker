import createNationalPage from '../pages/createNationalPage';
import { render } from '../nunjucks';
import cache from '../lib/cache';

const maxAge = 600; // 10 mins
const sMaxAge = 180; // 3 min
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

// IMPORTANT: this experiment hardcodes the polyfill service URL.
// If we change the URL by altering its feature or flags then we also need to update it here too.
const linkHeader = [
                    '<g-ui/critical.css>; as="style"; rel="preload"; nopush',
                    '<g-ui/main.css>; as="style"; rel="preload"; nopush',
                    '<main.css>; as="style"; rel="preload"; nopush',
                    '<g-ui/top.js>; as="script"; rel="preload"; nopush',
                    '<https://cdn.polyfill.io/v2/polyfill.min.js?callback=igPolyfillsLoaded&features=default-3.6,matchMedia,fetch,IntersectionObserver,HTMLPictureElement,Map|always|gated,Array.from|always|gated,Array.prototype.includes|always|gated&flags=gated&unknown=polyfill>; as="script"; rel="preload"; nopush'
                  ].join(', ');

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('Link', linkHeader);

  const html = await cache(
    'nationalpolls',
    async () => render('national.html', await createNationalPage()),
    maxAge * 1000 // 10 mins
  );

  res.send(html);
};
