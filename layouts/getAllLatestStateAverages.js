const db = require('../models/index');

// runs a psql query to get the latest 2-candidate polling averages for all states
export default () =>
  db.sequelize.query(
    'SELECT * FROM (SELECT ROW_NUMBER() OVER (PARTITION BY state ORDER BY date DESC) AS r, t.* FROM (SELECT * FROM "Pollaverages" WHERE pollnumcandidates = 2) t) x WHERE x.r <= 2;',
    { type: db.sequelize.QueryTypes.SELECT }
  );
