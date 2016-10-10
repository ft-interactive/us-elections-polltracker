/**
 * First run the server, then in another tab run:
 *   > node --require babel-register task/make-screenshots.js
 */

import 'hard-rejection/register';
import Pageres from 'pageres';
import moment from 'moment';
import path from 'path';
import fs from 'fs';

const START_DATE = moment('2016-09-15');
const END_DATE = moment();

(async () => {
  const tmp = path.resolve(__dirname, '..', 'tmp');

  // create a tmp directory (if it doesn't exist)
  try {
    fs.mkdirSync(tmp);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }

  // make an array of date strings
  const dates = [];
  {
    const startDate = moment(START_DATE);
    const endDate = moment(END_DATE);
    const d = startDate;

    while (d.isSameOrBefore(endDate)) {
      dates.push(d.format('YYYY-MM-DD'));
      d.add(1, 'days');
    }
  }

  // save a screengrab for each date
  const pageres = new Pageres();

  for (const date of dates) {
    const url = `http://localhost:5000/timemachine?date=${encodeURIComponent(date)}`;

    pageres
      .src(
        url,
        ['60x60'], // seems to make a good size, not sure why
        { delay: 1, filename: date }
      );

    pageres.on('warning', (...args) => {
      console.log('pageres warning', args);
    });
  }

  await pageres.dest(tmp).run();
})();
