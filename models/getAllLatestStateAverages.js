const db = require('./index');

// runs a psql query to get the latest polling averages for all states
async function getAllLatestStateAverages() {
  return db.sequelize.query('SELECT * FROM (SELECT ROW_NUMBER() OVER (PARTITION BY state ORDER BY date DESC) AS r, t.* FROM "Pollaverages" t) x WHERE x.r <= 2;', { type: db.sequelize.QueryTypes.SELECT })
    .then(data => data);
}

module.exports = getAllLatestStateAverages;
