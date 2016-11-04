export default Object.freeze({
  development: Object.freeze({
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: '127.0.0.1',
    dialect: 'postgres',
  }),
  test: Object.freeze({
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'postgres',
  }),
  production: Object.freeze({
    use_env_variable: 'DATABASE_URL',
  }),
});
