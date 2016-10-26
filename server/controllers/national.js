import createNationalPage from '../pages/createNationalPage';
import { render } from '../nunjucks';
import cache from '../lib/cache';

const maxAge = 180; // 3 mins
const sMaxAge = 60; // 1 min
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

// IMPORTANT: this experiment hardcodes the URL the Polyfill service
// url we're using. If we change that by altering its feature of flags
// then we also need to update this.
const linkHeader = [
                    '<g-ui/main.css>; as="style"; rel="preload"; nopush',
                    '<g-ui/critical.css>; as="style"; rel="preload"; nopush',
                    '<main.css>; as="style"; rel="preload"; nopush',
                    '<g-ui/top.js>; as="script"; rel="preload"; nopush',
                    '<https://cdn.polyfill.io/v2/polyfill.min.js?callback=igPolyfillsLoaded&features=default-3.6,matchMedia,fetch,IntersectionObserver,HTMLPictureElement,Map|always|gated,Array.from|always|gated,Array.prototype.includes|always|gated&flags=gated&unknown=polyfill&excludes=Symbol,Symbol.iterator,Symbol.species>; as="script"; rel="preload"; nopush'
                  ].join(', ');

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('Link', linkHeader);

  const html = await cache(
    'nationalpolls',
    async () => render('national.html', await createNationalPage()),
    maxAge * 1000 // 3 mins
  );

  res.send(html);
};
