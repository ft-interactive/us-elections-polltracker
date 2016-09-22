import db from '../models';

// runs a psql query to get data from db
export default () =>
  db.lastupdates.findOne({ raw: true }).then(data => data.lastupdate)
;
