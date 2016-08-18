'use strict';
module.exports = function(sequelize, DataTypes) {
  var Polldata = sequelize.define('Polldata', {
    rcpid: DataTypes.INTEGER,
    pollster: DataTypes.STRING,
    rcpUpdated: DataTypes.DATE,
    link: DataTypes.STRING,
    date: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    confidenceInterval: DataTypes.STRING,
    sampleSize: DataTypes.STRING,
    marginError: DataTypes.STRING,
    partisan: DataTypes.STRING,
    pollsterType: DataTypes.STRING,
    candidatename: DataTypes.STRING,
    pollvalue: DataTypes.FLOAT,
    state: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Polldata;
};