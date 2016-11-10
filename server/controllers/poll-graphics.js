import { makePollTimeSeries } from '../lib/polls';

import cache from '../lib/cache';

const maxAge = 1800; // 30 mins
const sMaxAge = 600; // 10 min
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

function qsCacheKey(queryRequest) {
  const paramOrder = ['background', 'startDate', 'endDate', 'size', 'type', 'state', 'logo', 'dots', 'key', 'pollnumcandidates', 'yAxisDomain'];

  const cacheKey = paramOrder.reduce(
    (a, b) => a + queryRequest[b],
    queryRequest.fontless
  );

  return cacheKey;
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', cacheControl);

  // res.status(400).send('');
  // return;

  // if (!req.query.startDate) {
  //   res.status(400).send('Missing start date');
  //   return;
  // }

  // if (!req.query.endDate) {
  //   res.status(400).send('Missing end date');
  //   return;
  // }

  const html = await cache(
    `polls-svg-${qsCacheKey(req.query)}`,
    async () => await makePollTimeSeries(req.query),
    maxAge * 1000 // 30 mins
  );

  res.send(html);
};
