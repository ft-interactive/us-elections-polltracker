const prod = process.env.NODE_ENV === 'production';

export default _ => ({
  prod: prod,
  errorReporting: true,
  analytics: true,
  googleAnalytics: true,
  ads: true,
  onwardjourney: true
})
