import * as spreadsheet from './spreadsheet';
import DataRefresher from '../data-refresh';

function fetchData() {
  return spreadsheet.republishAllSheets().then(() => {
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
