import { createPage } from '../pages/national-page';
import { render } from '../nunjucks';

const maxAge = 120;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res) => {
  const page = await createPage();
  res.setHeader('Cache-Control', cacheControl);
  res.send(render('national.html', page));
};

/*

let cachePage = true;
const pageCacheKey = `statePage-${state}`;

let renderedPage = cache.get(pageCacheKey); // check to see if we've cached this page recently

if (!renderedPage) {
   do everything
}

*/
