import {getBySlug, codeToSlug} from '../pages/state-page';
import { render } from '../nunjucks';

export default async (req, res) => {
  const state = req.params.state;

  // TODO: generic middleware for to send 500 errors
  //       for when stuff like this results in an unhandled rejection
  const page = await getBySlug(state);

  if (!page) {
    // see if we can redirect
    const slug = codeToSlug(state);

    if (slug) {
      res.redirect(`/state-${slug}`);
      return;
    }

    res.send(404);
    return;
  }

  res.send(render('state.html', page));
};
