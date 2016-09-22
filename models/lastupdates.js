import { DataTypes } from 'sequelize';

export default sequelize =>
  sequelize.define('lastupdates', {
    lastupdate: DataTypes.DATE,
  })
;
