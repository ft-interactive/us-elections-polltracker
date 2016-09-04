import { codeToSlug } from '../lib/states';

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
