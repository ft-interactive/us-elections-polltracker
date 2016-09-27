// DEPRECATED – this can be removed once next is no longer using it

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

  const layout = ecForecastBarsLayout(count);

  const getHTML = async override => {
    const data = { ...layout, override };

    return cache(
      `ec-forecast-component:${data.ancestorSelector}:styles:${data.includeStyles}`,
      async () => {
        const html = await render('ec-forecast-component.html', data);
        return minify(html, {
          minifyCSS: true,
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
        });
      }
    );
  };

  switch (ext) {
    case 'json':
      res.json({ __html: await getHTML() });
      break;

    case 'html': {
      const htmlWithStyles = await getHTML();
      const htmlWithoutStyles = await getHTML({ includeStyles: false });

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
        <div class="us-election-midriff-graphic card" style="width: 160px">${htmlWithStyles}</div>
        <div class="us-election-midriff-graphic card" style="width: 300px">${htmlWithoutStyles}</div>
        <div class="us-election-midriff-graphic card" style="width: 500px">${htmlWithoutStyles}</div>
      `);
      break;
    }

    default:
      res.status(404);
  }
};
