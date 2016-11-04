require('dotenv').config({ silent: true });

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error.stack);
  process.exit(1);
});

require('babel-register');
