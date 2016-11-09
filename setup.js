require('dotenv').config({ silent: true });

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error.stack);
});

require('babel-register');
