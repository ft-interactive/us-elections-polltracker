import cls from 'continuation-local-storage';
import Sequelize from 'sequelize';
import allConfig from '../config/db';

const config = allConfig[process.env.NODE_ENV || 'development'];

// automatically pass transactions to all queries (???)
const namespace = cls.createNamespace('poll-db');
Sequelize.cls = namespace;

// construct a sequelize instance
const sequelize = (config.use_env_variable ?
  new Sequelize(process.env[config.use_env_variable], {
    dialectOptions: { ssl: true },
    native: false,
    logging: false,
  }) :
  new Sequelize(config.database, config.username, config.password, config)
);

// construct db interface
const db = {
  // TODO find a less hacky way to do this, and fix capitalisation inconsistency
  /* eslint-disable global-require */
  lastupdates: require('./lastupdates').default(sequelize),
  Pollaverages: require('./pollaverages').default(sequelize),
  Polldata: require('./polldata').default(sequelize),
  /* eslint-enable global-require */
};

// set up associations for each model as necessary
for (const modelName of Object.keys(db)) {
  if (db[modelName].associate) db[modelName].associate(db);
}

// expose the instance
db.sequelize = sequelize;

export default db;
