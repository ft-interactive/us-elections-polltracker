import { createPage } from '../pages/state-page';
import { codeToSlug, isState } from '../lib/states';
import { render } from '../nunjucks';
import cache from '../lib/cache';

const maxAge = 120;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

const slugfixes = {
  nebraska1: 'nebraska',
  nebraska2: 'nebraska',
  nebraska3: 'nebraska',
  maine1: 'maine',
  maine2: 'maine',
};

export default async (req, res) => {
  const state = req.params.state;

  if (slugfixes[state]) {
    res.redirect(301, `${slugfixes[state]}-polls`);
    return;
  } else if (state === 'us') {
    res.redirect(301, 'polls');
    return;
  }

  // TODO: generic middleware for to send 500 errors
  //       for when stuff like this results in an unhandled rejection

  if (!isState(state)) {
    // see if we can redirect
    const slug = codeToSlug(state);

    if (slug) {
      res.redirect(301, `${slug}-polls`);
      return;
    }

    res.sendStatus(404);
    return;
  }

  res.setHeader('Cache-Control', cacheControl);

  const html = await cache(
    `statePage-${state}`,
    async () => render('state.html', await createPage(state))
  );

  res.send(html);
};
