'use strict';
module.exports = function(sequelize, DataTypes) {
  var Pollaverages = sequelize.define('Pollaverages', {
    date: DataTypes.DATE,
    candidatename: DataTypes.STRING,
    pollaverage: DataTypes.FLOAT,
    state: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Pollaverages;
};