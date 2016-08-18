'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/db.js')[env];
var db        = {};
const cls = require('continuation-local-storage');

// automatically pass transactions to all queries
const namespace = cls.createNamespace('poll-db');
Sequelize.cls = namespace;

const modelDir = path.normalize(__dirname+'/sequelize/');

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable], {
    dialectOptions: {
      ssl: true,
    }
  });
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync( modelDir )
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(modelDir, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
