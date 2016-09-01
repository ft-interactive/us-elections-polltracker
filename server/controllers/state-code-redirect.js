import { codeToSlug } from '../pages/state-page';

export default async (req, res) => {
  const state = req.params.code;
  const slug = codeToSlug(state);

  if (!slug) {
    return;
  }

  res.redirect(301, `/${slug}-polls`);
};
