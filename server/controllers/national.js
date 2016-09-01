import { createPage } from '../pages/national-page';
import { render } from '../nunjucks';

export default async (req, res) => {
  const page = await createPage();
  res.send(render('national.html', page));
};


/*

let state = 'us';
if (req.params.state) state = req.params.state;
const canonicalURL = `polls/${state}`;

res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}`);

let cachePage = true;
const pageCacheKey = `statePage-${state}`;

let renderedPage = cache.get(pageCacheKey); // check to see if we've cached this page recently

if (!renderedPage) {
   do everything
}

*/
