const prod = process.env.NODE_ENV === 'production';
const results = (process.env.ELECTION_RESULTS ?
                              process.env.ELECTION_RESULTS.toUpperCase() === 'TRUE' :
                              false);
const electionDayCountdown = (process.env.ELECTION_COUNTDOWN ?
                              process.env.ELECTION_COUNTDOWN.toUpperCase() === 'TRUE' :
                              false);

export default () => ({
  prod,
  electionDayCountdown,
  results,
  errorReporting: prod,
  analytics: prod,
  googleAnalytics: prod,
  ads: true,
  shareButtons: true,
  onwardJourney: true,
  nationalBar: true,
  forecastMap: 'choropleth', // Options: 'choropleth', 'dots'
  stateDemographics: true,
  header: true,
  footer: true,
  stateList: true,
  headerMarketingPromo: true,
  cookieMessage: true,
  resultSuggestedReads: true,
  resultMediaSurvey: true,
});
