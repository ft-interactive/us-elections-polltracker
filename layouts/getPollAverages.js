import * as d3 from 'd3';
import moment from 'moment';
import db from '../models';

const deleteTimezoneOffset = d3.timeFormat('%B %e, %Y');

export default async (state, startDate, _endDate, pollnumcandidates) => {
  // to capture data from anytime during the day (and timezone offsets), set endDate
  // to the start of the next day
  const endDate = moment(_endDate).add(1, 'day').format();

  const data = await db.Pollaverages.findAll({
    where: {
      state,
      pollnumcandidates,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    },
    order: [
      ['date', 'ASC'],
    ],
    raw: true,
  });

  for (const row of data) {
    row.date = new Date(deleteTimezoneOffset(row.date));
  }

  return data;
};
