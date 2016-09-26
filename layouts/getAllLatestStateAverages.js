import db from '../models';

// runs a psql query to get the latest polling averages for all states (choose 3 or 4-way based on displayRace)
export default pollnumcandidates =>
  db.sequelize.query(
    `SELECT * FROM (SELECT ROW_NUMBER() OVER (PARTITION BY state ORDER BY date DESC) AS r, t.* FROM (SELECT * FROM "Pollaverages" WHERE pollnumcandidates = ${pollnumcandidates}) t) x WHERE x.r <= ${pollnumcandidates};`,
    { type: db.sequelize.QueryTypes.SELECT }
  )
;
