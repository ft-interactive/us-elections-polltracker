import { DataTypes } from 'sequelize';

export default sequelize =>
  sequelize.define('Pollaverages', {
    date: DataTypes.DATE,
    candidatename: DataTypes.STRING,
    pollaverage: DataTypes.FLOAT,
    state: DataTypes.STRING,
    pollnumcandidates: DataTypes.INTEGER,
  })
;
