import { minify } from 'html-minifier';
import cache from '../lib/cache';
import { render } from '../nunjucks';
import nationalCount from '../lib/national-count';
import ecForecastBarsLayout from '../../layouts/ec-forecast-bars-layout';
import cssnano from 'cssnano';

const maxAge = 360;
const sMaxAge = 60;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;
const lruAge = maxAge * 1000; // 6 mins
const cssNanoOptions = {safe: true, sourcemap: false};

export default async (req, res) => {
  const { ext } = req.params;

  res.setHeader('Cache-Control', cacheControl);

  const count = await nationalCount();

  const layout = ecForecastBarsLayout(count, req.query.ancestorSelector);

  const html = await cache(
    `ec-forecast-component-2.html:${layout.ancestorSelector}`,

    async () => minify(await render('ec-forecast-component-2.html', layout), {
      minifyCSS: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      decodeEntities: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true,
    }),

    lruAge
  );

  const css = await cache(
    `ec-forecast-component-2.css:${layout.ancestorSelector}`,
    () => cssnano.process(render('ec-forecast-component-2.css', layout), cssNanoOptions)
              .then(result => result.css),
    lruAge * 10000000 // this doesnt change so cache for ages
  );

  switch (ext) {
    case 'json':
      res.json({ html, css });
      break;

    case 'html': {
      // this is for previewing in development - shows it 3 times at different sizes.

      res.send(`
        <!doctype html>
        <html class="no-js enhanced">
        <link rel="stylesheet" href="next-front-page.css">
        <style>
          body { display:block !important; }
          body > div {
            margin: 20px;
            padding: 20px;
            background: #fdf8f2;
          }

          ${css}
        </style>
        <div class="us-election-midriff-graphic card" style="width: 160px">${html}</div>
        <div class="us-election-midriff-graphic card" style="width: 300px">${html}</div>
        <div class="us-election-midriff-graphic card" style="width: 500px">${html}</div>
      `);
      break;
    }

    default:
      res.status(404);
  }
};
