import cache from '../lib/cache';
import { render } from '../nunjucks';
import nationalCount from '../lib/national-count';
import ecForecastBarsLayout from '../../layouts/ec-forecast-bars-layout';

const maxAge = 120;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res, type) => {
  const { ext } = req.params;

  res.setHeader('Cache-Control', cacheControl);

  const count = await nationalCount();

  const layout = ecForecastBarsLayout(count);

  const html = await cache(
    `ec-forecast-component:${layout.ancestorSelector}:styles:${layout.includeStyles}`,
    async () => render('ec-forecast-component.html', layout)
  );

  switch (ext) {
    case 'json':
      res.json({ __html: html });
      break;

    case 'html': {
      layout.includeStyles = false;
      const htmlWithoutStyles = await cache(
        `ec-forecast-component:${layout.ancestorSelector}:styles:${layout.includeStyles}`,
        async () => render('ec-forecast-component.html', layout)
      );

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
        </style>
        <div class="us-election-midriff-graphic card" style="width: 160px">${html}</div>
        <div class="us-election-midriff-graphic card" style="width: 300px">${htmlWithoutStyles}</div>
        <div class="us-election-midriff-graphic card" style="width: 500px">${htmlWithoutStyles}</div>
      `);
      break;
    }

    default:
      res.status(404);
  }
};
