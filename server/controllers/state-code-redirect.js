import { getByCode, getBySlug, getByContentId } from '../lib/states';

const foreverCC = 'max-age=365000000, immutable';

export default async (req, res, next) => {
  if (req.params.code.toLowerCase() === 'us') {
    res.setHeader('Cache-Control', foreverCC);
    res.redirect(301, 'polls');
    return;
  }

  const state = getByCode(req.params.code) ||
                getBySlug(req.params.code) ||
                getByContentId(req.params.code);

  if (!state) {
    next();
    return;
  }

  res.setHeader('Cache-Control', foreverCC);
  res.redirect(301, `${state.slug}-polls`);
};
