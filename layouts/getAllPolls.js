import db from '../models';

export default (state, pollnumcandidates) =>
  db.Polldata.findAll({
    where: { state, pollnumcandidates },
    order: [['endDate', 'ASC']],
    raw: true,
  })
;
