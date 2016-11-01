import { makePollTimeSeries } from '../lib/polls';

import cache from '../lib/cache';

const maxAge = 600; // 10 mins
const sMaxAge = 180; // 3 min
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

  const html = await cache(
    `polls-svg-${qsCacheKey(req.query)}`,
    async () => await makePollTimeSeries(req.query),
    maxAge * 1000 // 10 mins
  );

  res.send(html);
};
