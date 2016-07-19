'use strict';
module.exports = function(sequelize, DataTypes) {
  var lastupdates = sequelize.define('lastupdates', {
    lastupdate: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return lastupdates;
};