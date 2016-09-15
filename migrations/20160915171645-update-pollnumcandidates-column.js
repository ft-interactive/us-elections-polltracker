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
      queryInterface.sequelize.query('UPDATE "Pollaverages" SET pollnumcandidates = 2 WHERE pollnumcandidates IS NULL;'),
      queryInterface.sequelize.query('UPDATE "Polldata" SET pollnumcandidates = 2 WHERE pollnumcandidates IS NULL;'),
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
      queryInterface.sequelize.query('UPDATE "Pollaverages" SET pollnumcandidates = null;'),
      queryInterface.sequelize.query('UPDATE "Polldata" SET pollnumcandidates = null;'),
    ];
  },
};
