const prod = process.env.NODE_ENV === 'production';

export default () => ({
  prod,
  errorReporting: prod,
  analytics: prod,
  googleAnalytics: prod,
  ads: true,
  shareButtons: true,
  onwardJourney: true,
  nationalBar: true,
  stateDemographics: true,
  forecastMap: 'choropleth', // Options: 'choropleth', 'dots'
  header: true,
  footer: true,
  stateList: true,
});
