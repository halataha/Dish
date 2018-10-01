'use strict';

const extend = require('lodash').assign;
const mysql = require('mysql');
const config = require('../config');

const options = (config.get('HOST') !== '') ? { user:
config.get('MYSQL_USER'),password: config.get('MYSQL_PASSWORD'),database:
config.get('DATABASE'),host: config.get('HOST')} : { user:
config.get('MYSQL_USER'),password: config.get('MYSQL_PASSWORD'),database:
config.get('DATABASE') }

const connection = mysql.createConnection(options);

function dishmizer (limit, token, cb) {
 // token = token ? parseInt(token, 8) : 0;
  var query = connection.query(
    'select u.user_id,u.username,u.imageUrl,m.value,m.content_description,(select AVG(rating) from dz_rating where content_type_id = u.user_id AND content_type = "dishmizer") as rating from dz_user u left join dz_meta m On u.user_id = m.content_type_id and m.content_type = "dishmizer" AND u.active = 1 ORDER BY u.last_update DESC  LIMIT ? OFFSET ?', [limit, token],
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, results);
    }
  );
}

function countDishmizer (cb) {
  connection.query(
    'select COUNT(*) as total from dz_user where active = 1',
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, results[0]);
    }
  );
}

module.exports = {
dishmizer:dishmizer,
countDishmizer:countDishmizer
};

if (module === require.main) {
  const prompt = require('prompt');
  prompt.start();

  console.log(
    `Running this script directly will allow you to initialize your mysql
    database.\n This script will not modify any existing tables.\n`);

  prompt.get(['user', 'password'], (err, result) => {
    if (err) {
      return;
    }
    createSchema(result);
  });
}

function createSchema (config) {
  const connection = mysql.createConnection(extend({
    multipleStatements: true
  }, config));

  connection.query(
    `CREATE DATABASE IF NOT EXISTS \`bookshelf\`
      DEFAULT CHARACTER SET = 'utf8'
      DEFAULT COLLATE 'utf8_general_ci';
    USE \`bookshelf\`;
    CREATE TABLE IF NOT EXISTS \`bookshelf\`.\`books\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`title\` VARCHAR(255) NULL,
      \`author\` VARCHAR(255) NULL,
      \`publishedDate\` VARCHAR(255) NULL,
      \`imageUrl\` VARCHAR(255) NULL,
      \`description\` TEXT NULL,
      \`createdBy\` VARCHAR(255) NULL,
      \`createdById\` VARCHAR(255) NULL,
    PRIMARY KEY (\`id\`));`,
    (err) => {
      if (err) {
        throw err;
      }
      console.log('Successfully created schema');
      connection.end();
    }
  );
}
