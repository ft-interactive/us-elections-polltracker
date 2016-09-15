'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    return [
      queryInterface.sequelize.query('UPDATE "Pollaverages" SET pollNumCandidates = 2 WHERE pollNumCandidates = null;'),
      queryInterface.sequelize.query('UPDATE "Polldata" SET pollNumCandidates = 2 WHERE pollNumCandidates = null;'),
    ];
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return [
      queryInterface.sequelize.query('UPDATE "Pollaverages" SET pollNumCandidates = null;'),
      queryInterface.sequelize.query('UPDATE "Polldata" SET pollNumCandidates = null;'),
    ];
  },
};
