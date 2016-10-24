import createStatePage from '../pages/createStatePage';
import { codeToSlug, isState } from '../lib/states';
import { render } from '../nunjucks';
import cache from '../lib/cache';

const maxAge = 360; // 6 mins
const sMaxAge = 60; // 1 min
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;
const foreverCC = 'max-age=365000000, immutable';

const slugfixes = {
  // nebraska: 'nebraska1',
  // maine: 'maine1',
};

export default async (req, res) => {
  const state = req.params.state;

  if (slugfixes[state]) {
    res.setHeader('Cache-Control', foreverCC);
    res.redirect(301, `${slugfixes[state]}-polls`);
    return;
  } else if (state === 'us') {
    res.setHeader('Cache-Control', foreverCC);
    res.redirect(301, 'polls');
    return;
  }

  // TODO: generic middleware for to send 500 errors
  //       for when stuff like this results in an unhandled rejection

  if (!isState(state)) {
    // see if we can redirect
    const slug = codeToSlug(state);

    if (slug) {
      res.setHeader('Cache-Control', foreverCC);
      res.redirect(301, `${slug}-polls`);
      return;
    }

    res.sendStatus(404);
    return;
  }

  res.setHeader('Cache-Control', cacheControl);

  const html = await cache(
    `statePage-${state}`,
    async () => render('state.html', await createStatePage(state)),
    maxAge * 1000 // 6 mins
  );

  res.send(html);
};
