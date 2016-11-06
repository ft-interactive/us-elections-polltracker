import { getByCode } from '../states';

// TODO: more testing!!!
// TODO: count states. with DC, maine etc
// Change homepage to accept HTML in footnote.

// console.assert(dynamicFootnote('[none]', {numComplete: 5}) === '', 'A');
// console.assert(dynamicFootnote('[auto]', {numComplete: 5}) === '5 of X states reporting as of TIME', 'B');
// console.assert(dynamicFootnote('', {numComplete: 5}) === '5 of X states reporting as of TIME', 'C');
// console.log(dynamicFootnote('This is the {time} and {complete}', {numComplete: 5}))
// console.assert(dynamicFootnote('This is {foo} the {time} and {complete}', {numComplete: 5}) === 'This is the TIME and 5', 'D');

function oDateTimeElement(date, displayTime = true) {
  const timestring = displayTime ? `${date.getUTCHours()}:${date.getUTCMinutes()}` : 'DD';
  return `<time class="article__timestamp o-date" data-o-component="o-date" datetime="${date.toISOString()}" data-o-date-js>${timestring}</time>`;
}

function remainingStates(electoralCollege, limit = Infinity) {
  return electoralCollege.slice(0).filter(d => !d.winner)
            .sort(({ecvotes:a}, {ecvotes: b}) => b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN)
            .slice(0, limit)
            .map(d => getByCode(d.code).name);
}

function listThings(arr) {
  return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length -1];
}

export default function dynamicFootnote(template, time, president, electoralCollege) {
  if (template === '[none]') {
    return '';
  }

  const hasTokens = !!template && template.indexOf('{') !== -1;

  if (!template || template === '[auto]') {
    if (president.isFinal) {
      return 'Final result';
    } else if (!president.hasMajority && president.numIncomplete < 4) {
      return `Awaiting results in ${listThings(remainingStates(electoralCollege, 3))}`;
    } else {
      return `${president.numVotes} of 538 electoral votes accounted for`;
    }
  } else if (hasTokens) {
    return template.replace(/{\s*/g, '{=').replace(/\s*}/g, '=}').split(/[{}]/g).map(function(t){
      if (!t.startsWith('=') || !t.endsWith('=')) return t;
      const token = t.toUpperCase();
      switch (token) {
        case '=CLINTON=':
          return president.clinton;
        case '=TRUMP=':
          return president.trump;
        case '=CLINTON_PCT=':
          return president.clinton_pct;
        case '=TRUMP_PCT=':
          return president.trump_pct;
        case '=TIME=':
          return oDateTimeElement(time);
        case '=EC_COMPLETE=':
          return president.numVotes;
        case '=EC_REMAINING=':
          return Math.max(538 - president.numVotes, 0);
        case '=STATES_REMAINING=':
          return president.numIncomplete;
        case '=STATES_COMPLETE=':
          return president.numComplete;
        case '=LIST_REMAINING=':
          return listThings(remainingStates(electoralCollege, 3));
        default:
          return '';
      }
    }).join('').replace(/\s{2,}/g, ' ');

  } else if (!hasTokens && template) {
    return template;
  }
  return '';
}
