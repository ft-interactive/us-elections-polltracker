import { env } from '../../nunjucks';

const markdown = env.filters.md;

const defaults = {
  headline: null,
  subtitle: null,
  interstitialtext: null,
  housefootnote: null,
  senatefootnote: null,
  statebreakdowntitle: null,
  statebreakdownsubtitle: null,
  congresstext: null,
  statetabletext: null,
};

export default function processConfigSheet(rows) {
  return (rows || []).reduce((map, row) => {
    const key = (row.key || '').toString().trim();
    const type = (row.type || '').toString().trim().toLowerCase().replace(/\s/g, '');
    let value = (row.value || '').toString().trim();

    if (!key) return map;

    if (type) {
      if (type === 'note') {
        return map;
      } else if (type === 'number') {
        value = Number.parseFloat(value);
      } else if (type === 'integer') {
        value = Number.parseInt(value, 10);
      } else if (type === 'markdown') {
        value = markdown(value, true).val;
      } else if (type === 'blockmarkdown' || type === 'markdownblock') {
        value = markdown(value, false).val;
      } else if (type === 'boolean') {
        value = value.toLowerCase();
        value = value === 'true' ? true : (value === 'false' || value === '' ? false : NaN);
      }
    }

    if (Number.isNaN(value))
      return map;

    map[key] = value;
    return map;
  }, {
    ...defaults
  });
}
