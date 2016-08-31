const prod = process.env.NODE_ENV === 'production';

export default () => ({
  prod,
  errorReporting: prod,
  analytics: prod,
  googleAnalytics: prod,
  ads: true,
  shareButtons: true,
  onwardjourney: true,
  nationalBar: true,
  forecastMap: 'dots', // Options: 'choropleth', 'dots'
  stateDemographics: true,
});
