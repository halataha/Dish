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


function single_topic (limit, token,id,cb) {
 // token = token ? parseInt(token, 10) : 0;
  var query = connection.query(
    'SELECT m.user_id,m.content_type,m.content_description,m.content_type_id,m.date,c.title,c.description,du.firstname,du.lastname,du.email,du.imageUrl FROM dz_meta m LEFT JOIN dz_user du ON m.user_id = du.user_id LEFT JOIN dz_community c ON m.content_type_id = c.community_id WHERE m.content_type_id = '+id+' AND m.content_type = "community" ORDER BY m.last_update DESC LIMIT ? OFFSET ?', [limit, token],
    (err, results) => {
      
      if (err) {
        cb(err);
        return;
      }
   //   const hasMore = results.length === limit ? token + results.length : false;
      cb(null, results);
    }
  );
}


function countPost (id,cb) {
 var query = connection.query(
    'SELECT COUNT(meta_id) AS total FROM dz_meta WHERE content_type_id = '+id+' AND content_type="community"',
    (err, results) => {
      if (err) {
        //cb(err);
        return;
      }
      cb(null, results[0]);
    }
  );
}


module.exports = {
single_topic:single_topic,
countPost:countPost
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
