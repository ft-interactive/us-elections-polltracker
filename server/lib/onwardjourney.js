import axios from 'axios';
import cache from '../lib/cache';

const fetchSuggestedReads = ({list, limit = 10}) =>
  cache(
    `suggestedReads:${list}:${limit}`,
    () => axios.get(`https://ig.ft.com/onwardjourney/v1/${list}/json/?limit=${limit}`, { timeout: 3000 }).then(response => response.data),
    3 * 60 * 1000 // 3 mins
  );

export default function getOnwardJourney({suggestedReads, relatedContent = []} = {}) {
  const result = {
    suggestedReads: {
      list: suggestedReads,
      limit: 4,
    },
    relatedContent: relatedContent.map(list => ({rows: 1, list}))
  };

  if (!suggestedReads) {
    return Promise.resolve(result);
  }

  return fetchSuggestedReads(result.suggestedReads)
    .then(data => {
      result.suggestedReads.data = data;
      return result;
    })
    .catch(reason => {
      console.error(reason);
      // swallow error. if we cant get the onward journey suggestedReads links
      // no need to fail to render the page
      return result;
    })
}
