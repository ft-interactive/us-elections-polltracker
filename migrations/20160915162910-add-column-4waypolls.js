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
      queryInterface.addColumn(
        'Pollaverages',
        'pollNumCandidates',
        {
          type: Sequelize.INTEGER,
          defaultValue: null,
        }
      ),
      queryInterface.addColumn(
        'Polldata',
        'pollNumCandidates',
        {
          type: Sequelize.INTEGER,
          defaultValue: null,
        }
      ),
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
      queryInterface.removeColumn('Pollaverages', 'pollNumCandidates'),
      queryInterface.removeColumn('Polldata', 'pollNumCandidates'),
    ];
  },
};
