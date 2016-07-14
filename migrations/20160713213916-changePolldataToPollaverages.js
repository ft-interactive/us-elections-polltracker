'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Polldata');
  },
};