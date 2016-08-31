import {getBySlug, codeToSlug} from '../pages/state-page';
import { render } from '../nunjucks';

export default async (req, res) => {
  const state = req.params.state;
  const page = getBySlug(state);

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

  await page.ready();

  res.send(render('state.html', page));
};
