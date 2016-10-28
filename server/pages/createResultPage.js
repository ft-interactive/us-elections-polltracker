import Page from './page';
import getResult from '../lib/getResultData';
import dotMapLayout from '../../layouts/results-dot-map';
import mapLayout from '../../layouts/results-map';
import onwardJourney from '../lib/onwardjourney';
import statesList from '../../data/states';

class ResultPage extends Page {

  // TODO: description = 'Polling data for the 2016 US presidential election';
  // TODO: socialHeadline = 'US presidential election: here\'s where the polls stand';
  // TODO: socialSummary = 'US election poll tracker: Here\'s who\'s ahead';
  // TODO: publishedDate
  // TODO: canonicalUrl
  // TODO: mainImage = {
  //          url: 'https://image.webservices.ft.com/v1/images/raw/https:%2F%2Fig.ft.com%2Fstatic%2Fus-election-2016%2Fsocial.jpg?source=ig&format=jpg&quality=high&width=800',
  //       };

  id = '5cc27b78-946b-11e6-a1dc-bdf38d484582';

  title = 'Presidential election result';

  url = 'https://ig.ft.com/us-elections/results';

  // TODO: what's this for?
  code = 'us';

  async ready() {
    const result = await getResult();
    this.headline = result.copy.headline;
    this.summary = result.copy.subtitle;
    this.stateResults = result.electoralCollege;
    this.overview = result.overview;
    this.mediaOrgs = result.mediaOrgs;
    // this.color = color;
    this.mapnote = `<b>${result.overview.president.states_reporting}</b> states reporting. <b>${result.overview.president.clinton + result.overview.president.trump}</b> of <b>538</b> votes accounted for`;
    this.dotMapSelectors = dotMapLayout(result.electoralCollege, { width: 800, height: 500 });
    this.mapSelectors = mapLayout(result.electoralCollege, { width: 800, height: 500 });
    this.keyStates = statesList.reduce((previous, current) => {
      previous[current.code] = current.swing; // eslint-disable-line no-param-reassign
      return previous;
    }, {});

    this.onwardJourney = await onwardJourney({
      // Home page US Election headpiece
      suggestedReads: 'list/dbd61736-8af1-11e6-8aa5-f79f5696c731',
      relatedContent: [
        // "US Election 2016" stream
        'thing/N2UxNTM3MzItNWNlZC00MDc5LWI3ODUtYWNmZDA2YjE0MWE2-U2VjdGlvbnM=',
        // Home page Highlights section
        'list/highlights',
      ],
    });
  }
}

export default async () => {
  const page = new ResultPage();
  await page.ready();
  return page;
};
