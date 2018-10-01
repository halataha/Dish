'use strict';

const nconf = module.exports = require('nconf');
const path = require('path');

nconf
  // 1. Command-line arguments
  .argv()
  // 2. Environment variables
  .env([
    'DATA_BACKEND',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'POST',
    'NODE_ENV',
    'PORT',
    'SECRET'
  ])
  // 3. Config file
  .file({ file: path.join(__dirname, 'config.json') })
  // 4. Defaults
  .defaults({
    DATA_BACKEND: 'cloudsql',
    MYSQL_USER: '',
    MYSQL_PASSWORD: '',
    PORT: 3000,
    SECRET: 'keyboardcat'
  });


if (nconf.get('DATA_BACKEND') === 'cloudsql') {
  checkConfig('MYSQL_USER');
  checkConfig('MYSQL_PASSWORD');
  
}

function checkConfig (setting) {
  if (!nconf.get(setting)) {
    throw new Error(`You must set ${setting} as an environment variable or in config.json!`);
  }
}
