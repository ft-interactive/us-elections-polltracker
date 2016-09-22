'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn(
      'Polldata',
      'link',
      { type: Sequelize.STRING(1024) }
    );
  }
};
