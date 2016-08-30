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
  forecastMap: 'choropleth', // Options: 'choropleth', 'dots'
  stateDemographics: true,
  forecastMap: true,
  header: true,
  footer: true,
});
