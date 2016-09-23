import axios from 'axios';
import DataRefresher from './data-refresh';

const CONFIG_URL = (process.env.CONFIG_URL ||
                                'http://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/options');

function fetchData() {
  return axios.get(CONFIG_URL, { timeout: 10000 }).then(response => {
    if (!Array.isArray(response.data) || !response.data.length) {
      throw new Error('Cannot get content');
    }

    return response.data.reduce((map, row) =>
                map.set(row.name, row.value), new Map());
  });
}

function fetchError(error) {
  if (error instanceof Error) {
    const url = error.config && error.config.url;
    console.log(error.message, error.code, url);
  } else {
    console.error(error);
  }
}

const refresher = new DataRefresher('*/30 * * * * *', fetchData, { fallbackData: new Map(), logErrors: false });

refresher.on('error', fetchError);

export async function getEditorsConfig() {
  return await refresher.promise();
}

export async function getEditorsConfigProperty(property) {
  const config = await getEditorsConfig();
  return config.get(property);
}
