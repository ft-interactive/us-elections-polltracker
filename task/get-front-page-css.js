import getCSS from 'get-css';
import fs from 'fs';
import path from 'path';

(async () => {
  const result = await getCSS('https://www.ft.com/', { verbose: true });

  fs.writeFileSync(path.resolve(__dirname, '..', 'public', 'next-front-page.css'), result.css);
})();
