import axios from 'axios';
import DataRefresher from './data-refresh';

const CONFIG_URL = (process.env.CONFIG_URL ||
                                'http://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/options');

function fetchData() {
  return axios.get(CONFIG_URL, {timeout: 5000}).then(response => {
    if (!Array.isArray(response.data) || !response.data.length) {
      throw new Error('Cannot get content');
    }

    return response.data.reduce((map, row) =>
                map.set(row.name, row.value), new Map());
  });
}

const refresher = new DataRefresher('*/30 * * * * *', fetchData);

export function getEditorsConfig() {
  if (refresher.data instanceof Map)
    return Promise.resolve(refresher.data);
  else
    return refresher.tick();
}

export function getEditorsConfigProperty(property) {
  return getEditorsConfig().then(config => config.get(property));
}
