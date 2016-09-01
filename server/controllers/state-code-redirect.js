import { codeToSlug } from '../pages/state-page';

export default async (req, res) => {
  const slug = codeToSlug(req.params.code);

  if (!slug) {
    return;
  }

  res.redirect(301, `/${slug}-polls`);
};
