import createTimemachinePage from '../pages/createTimemachinePage';
import { render } from '../nunjucks';
import cache from '../lib/cache';

const maxAge = 120;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);

  const timeMachineDate = req.query.date;

  const html = await cache(
    `timemachine-${timeMachineDate}`,
    async () => render('timemachine.html', await createTimemachinePage(timeMachineDate))
  );

  res.send(html);
};
