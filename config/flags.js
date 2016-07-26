const prod = process.env.NODE_ENV === 'production';

export default () => ({
  prod,
  errorReporting: prod,
  analytics: true,
  googleAnalytics: true,
  ads: true,
  shareButtons: true,
  onwardjourney: false,
});
