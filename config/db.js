var dotenv = require('dotenv');

dotenv.load({ silent: true });

module.exports = {
  "development": {
    "username": process.env.PGUSER,
    "password": process.env.PGPASSWORD,
    "database": process.env.PGDATABASE,
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: true,
    }
  }
}
