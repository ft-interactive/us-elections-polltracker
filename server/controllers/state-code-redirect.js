import { codeToSlug } from '../pages/state-page';

export default async (req, res) => {
  if (req.params.code === 'us') {
    res.redirect(301, '/polls');
    return;
  }

  const slug = codeToSlug(req.params.code);

  if (!slug) {
    return;
  }

  res.redirect(301, `/${slug}-polls`);
};
