import { getByCode, getBySlug, getByContentId } from '../lib/states';

export default async (req, res, next) => {
  if (req.params.code.toLowerCase() === 'us') {
    res.redirect(301, 'polls');
    return;
  }

  const state = getByCode(req.params.code) ||
                getBySlug(req.params.code) ||
                getByContentId(req.params.code);

  if (!state) {
    next()
    return;
  }

  res.redirect(301, `${state.slug}-polls`);
};
