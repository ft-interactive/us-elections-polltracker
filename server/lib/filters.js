import { category } from './margin-category';
import { codeToSlug, getByCode, getBySlug, getResultsByCode } from './states';

export function commas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function round1dp(n) {
  return Math.round(n * 10) / 10;
}

const monthsAbbr = [
  'Jan', 'Feb', 'Mar', 'Apr',
  'May', 'Jun', 'Jul', 'Aug',
  'Sep', 'Oct', 'Nov', 'Dec'
];

export function statePollPageURL(state) {
  if (!state) return '';
  let slug = state.slug ? state.slug : codeToSlug(state);
  if (!slug) {
    const s = getBySlug(state);
    if (s) {
      slug = s.slug;
    }
  }
  return slug ? `${slug}-polls` : '';
}

export function stateShortname(code, override = {}) {
  let state = typeof code === 'string' ? getByCode(code) : code;
  if (!state) {
    state = getBySlug(code);
    if (!state) {
      return '';
    }
  }
  return override[state.code] || state.shortName || state.name;
}

export function stateName(code, override = {}) {
  if (!code) return '';
  if(override[code]) return override[code];
  if(getByCode(code)) return getByCode(code).name;
  return code;
}

export function winner2012(code){
  return getResultsByCode(code.toUpperCase(), 2012);
}

// turn 8/26 - 8/29 to Aug 26 - 29
export function formatDateForIndividualPollsTable(inputDate) {
  if (inputDate.match(/\d+\/\d+ - \d+\/\d+/)) {
    const dateMatch = /(\d+)\/(\d+) - (\d+)\/(\d+)/.exec(inputDate);
    const startMonth = monthsAbbr[dateMatch[1] - 1];
    const startDay = dateMatch[2];
    const endMonth = monthsAbbr[dateMatch[3] - 1];
    const endDay = dateMatch[4];

    let formattedDate = `${startMonth} ${startDay} - ${endDay}`;
    if (startMonth !== endMonth) {
      formattedDate = `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }
    return formattedDate;
  }
  return inputDate;
}

// takes '24,104 RV' and returns '24,104 <span class="sampleType">RV</span>'
export function formatSampleSizeForIndividualPollsTable(sampleSizeString) {
  return sampleSizeString.replace(/ (RV|LV|A)/, ' <span class="sampleType">$1</span>');
}

export function marginCategory(margin) {
  return category(margin);
}

export function orderStatesByImportance(states) {
  const statesWithPollDate = [];
  const statesWithout = [];

  Object.keys(states).forEach(code => {
    const state = states[code];
    const array = state.Clinton != null
                        ? statesWithPollDate
                        : statesWithout;
    array.push(state);
  });

  // sort items with poll averages by value
  statesWithPollDate.sort((a, b) => {
    const aMargin = Math.abs(0 - a.margin);
    const bMargin = Math.abs(0 - b.margin);
    if (aMargin !== bMargin) {
      return aMargin - bMargin; // compare how close numbers are to 0
    }
    return aMargin - bMargin - ((a.ecVotes - b.ecVotes) / 1000); // if equal distance to 0, sort by ecVotes
  });
  statesWithout.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return 1;
    }
    return 0;
  }); // sort alphabetically

  return statesWithPollDate.concat(statesWithout);
}
0
