import axios from 'axios';

const CONFIG_URL = (process.env.CONFIG_URL ||
                                'http://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/options');
let cachedRequest;

// TODO: replace with a fail stale poller
export async function getEditorsConfig() {
  if (cachedRequest) return cachedRequest;

  cachedRequest = axios.get(CONFIG_URL, { timeout: 3000 })
          .then(response =>
            response.data.reduce((map, d) => map.set(d.name, d.value), new Map())
          )
          .catch(reason => {
            cachedRequest = null;
            if (reason && reason.code === 'ECONNABORTED') {
              return;
            }
            throw reason;
          });
  return cachedRequest;
}

export async function getEditorsConfigProperty(property) {
  return getEditorsConfig().then(config => config.get(property));
}
