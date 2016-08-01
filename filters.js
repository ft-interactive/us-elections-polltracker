import nunjucks from 'nunjucks';
import { utcFormat } from 'd3-time-format';

const formatterCache = new Map();
const defaultFTDateFormat = '%A, %-e %B %Y';

export function isotime(date) {
  if (!date) {
    return '';
  } else if (!(date instanceof Date)) {
    return date;
  }

  return date.toISOString();
}

// strftime format docs: https://github.com/d3/d3-time-format
export function strftime(date, format = defaultFTDateFormat) {
  if (!date) {
    return '';
  } else if (!(date instanceof Date)) {
    return date;
  }

  if (formatterCache.has(format)) {
    return formatterCache.get(format)(date);
  }

  const fm = utcFormat(format);
  formatterCache.set(format, fm);
  return fm(date);
}

export function ftdate(d) {
  return strftime(d);
}

export function commas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function encodedJSON(str) {
  try {
    return encodeURIComponent(JSON.stringify(JSON.parse(str || ''), null, ''));
  } catch (e) {
    return '';
  }
}

export function spoorTrackingPixel(str) {
  const json = encodedJSON(str.trim());
  const img = `<img src="https://spoor-api.ft.com/px.gif?data=${json}" height="1" width="1" />`;

  /* Add this conditional comment before the <noscript> once Core/Enhanced is
     properley implemented:

     <!--[if lt IE 9]>
       ${img}
    <![endif]-->
  */
  return new nunjucks.runtime.SafeString(`<noscript data-o-component="o-tracking">${img}</noscript>`);
}
