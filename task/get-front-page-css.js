/*
  Run this script with `babel-node task/get-front-page-css` to grab all the CSS
  from the live ft.com front page and save it to public/next-front-page.css,
  which is used for previewing components in their intended context.
 */

import getCSS from 'get-css';
import fs from 'fs';
import path from 'path';

(async () => {
  const result = await getCSS('https://www.ft.com/', { verbose: true });

  fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'next-front-page.css'), result.css);
})();
