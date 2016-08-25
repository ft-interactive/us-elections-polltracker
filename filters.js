import nunjucks from 'nunjucks';
const d3 = require('d3');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                  'September', 'October', 'November', 'December'];

export function ftdate(d) {
  const day = days[d.getUTCDay()];
  const month = months[d.getUTCMonth()];
  return !d ? '' : `${day}, ${d.getUTCDate()} ${month}, ${d.getUTCFullYear()}`;
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

export function round1dp(n) {
  return Math.round(n * 10) / 10;
}

export function getClassificationFromMargin(margin) {
  const classification = d3.scaleThreshold()
    .range(['rep', 'leaningRep', 'swing', 'leaningDem', 'dem'])
    .domain([-10, -5, 5, 10]);

  return classification(margin);
}
