import * as spreadsheet from './spreadsheet';
import DataRefresher from '../data-refresh';


const CONFIG_URL = (process.env.CONFIG_URL ||
                                'http://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/options');

function fetchData() {
  return spreadsheet.republishAllSheets().then(response => {
    // if (!Array.isArray(response.data) || !response.data.length) {
    //   throw new Error('Cannot get content');
    // }
    //
    // return response.data.reduce((map, row) =>
    //             map.set(row.name, row.value), new Map());
    return 'ok';
  });
}

function fetchError(error) {
  if (error instanceof Error) {
    const url = error.config && error.config.url;
    console.error(error.message, error.code, url);
  } else {
    console.error(error);
  }
}

const refresher = new DataRefresher('* * * * * *', fetchData, { fallbackData: new Map(), logErrors: false });

refresher.on('error', fetchError);

refresher.on('result', function(){
  const now = new Date()
  console.log(`Republished at ${now.toISOString()}`);
});

refresher.on('start', function(){
  const now = new Date()
  console.log(`Republisher started at at ${now.toISOString()}`);
});
