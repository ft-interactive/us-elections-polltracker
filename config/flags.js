const prod = process.env.NODE_ENV === 'production';

export default () => ({
  prod,
  errorReporting: prod,
  analytics: prod,
  googleAnalytics: prod,
  ads: true,
  shareButtons: true,
  onwardjourney: false,
  nationalBar: true,
});
