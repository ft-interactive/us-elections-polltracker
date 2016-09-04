import { createPage } from '../pages/state-page';
import { codeToSlug } from '../lib/states';
import { render } from '../nunjucks';

const maxAge = 120;
const sMaxAge = 10;
const cacheControl = `public, max-age=${maxAge}, s-maxage=${sMaxAge}`;

const slugfixes = {
  nebraska: 'nebraska1',
  maine: 'maine1',
};

export default async (req, res) => {
  const state = req.params.state;

  if (slugfixes[state]) {
    res.redirect(301, `/${slugfixes[state]}-polls`);
    return;
  }

  // TODO: generic middleware for to send 500 errors
  //       for when stuff like this results in an unhandled rejection
  const page = await createPage(state);
  if (!page) {
    // see if we can redirect
    const slug = codeToSlug(state);

    if (slug) {
      res.redirect(301, `/${slug}-polls`);
      return;
    }

    res.send(404);
    return;
  }

  res.setHeader('Cache-Control', cacheControl);
  res.send(render('state.html', page));
};
