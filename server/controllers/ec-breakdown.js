import cache from '../lib/cache';
import { render } from '../nunjucks';
import stateCount from '../lib/state-counts';
// import ecForecastBarsLayout from '../../layouts/ec-forecastbars-layout';
import classifyState from '../../layouts/state-classifications';

const maxAge = 120;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

export default async (req, res) => {
  res.setHeader('Cache-Control', cacheControl);
  const stateLookup = await stateCount();
  // classify the data

  const states = Object.keys(stateLookup)
    .map(function (key) {
      const state = stateLookup[key];
      const forecast = (state.code === 'ME' || state.code === 'ME') 
        ? classifyState.forecastMENE(state.margin) : classifyState.forecast(state.margin);

      return Object.assign({ forecast }, stateLookup[key]);
    });

  console.log(states);
  const layout = { title: 'breakdown', fontless: false };
  const html = await cache(
    'ec-breakdown-fontless:' + layout.fontless,
    async () => render('ec-breakdown.html', layout)
  );

  res.send(html);
};
