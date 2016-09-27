import { minify } from 'html-minifier';
import cache from '../lib/cache';
import { render } from '../nunjucks';
import nationalCount from '../lib/national-count';
import ecForecastBarsLayout from '../../layouts/ec-forecast-bars-layout';

const maxAge = 120;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

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
    })
  );

  const css = await cache(
    `ec-forecast-component-2.css:${layout.ancestorSelector}`,

    async () => render('ec-forecast-component-2.css', layout) // TODO minify CSS
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
