'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Polldata', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      rcpid: {
        type: Sequelize.INTEGER,
      },
      pollster: {
        type: Sequelize.STRING,
      },
      rcpUpdated: {
        type: Sequelize.DATE,
      },
      link: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.STRING,
      },
      startDate: {
        type: Sequelize.DATE,
      },
      endDate: {
        type: Sequelize.DATE,
      },
      confidenceInterval: {
        type: Sequelize.STRING,
      },
      sampleSize: {
        type: Sequelize.STRING,
      },
      marginError: {
        type: Sequelize.STRING,
      },
      partisan: {
        type: Sequelize.STRING,
      },
      pollsterType: {
        type: Sequelize.STRING,
      },
      candidatename: {
        type: Sequelize.STRING,
      },
      pollvalue: {
        type: Sequelize.FLOAT,
      },
      state: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Polldata');
  },
};