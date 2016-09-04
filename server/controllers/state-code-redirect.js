import { getByCode, getBySlug, getByContentId } from '../lib/states';

export default async (req, res) => {
  if (req.params.code === 'us') {
    res.redirect(301, '/polls');
    return;
  }

  const state = getByCode(req.params.code) ||
                getBySlug(req.params.code) ||
                getByContentId(req.params.code);

  if (!state) {
    res.sendStatus(404);
    return;
  }

  res.redirect(301, `/${state.slug}-polls`);
};
