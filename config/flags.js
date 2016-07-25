const prod = process.env.NODE_ENV === 'production';

export default _ => ({
  prod: prod,
  errorReporting: prod,
  analytics: prod,
  googleAnalytics: prod,
  ads: true,
  shareButtons: true,
  onwardjourney: false
})
