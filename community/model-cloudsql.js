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

connection.connect(function(err) {
  //console.log('errorrrrrr');
  //console.log(err); // 'ECONNREFUSED'
   // true
}); 

function fetchCommunity (cb) {
 var query = connection.query(
 'SELECT community_id,title,description FROM `dz_community`',(err, results) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, results);
    });
}

function countAll (cb) {
  var query = connection.query(
  'SELECT community_id,title,description FROM `dz_community`',(err, results) => {
       if (err) {
         cb(err);
         return;
       }
       cb(null, results);
     });
 }

function create (data,table,cb) {
  
 var query =  connection.query('INSERT INTO '+table+' SET ?', data, (err, res) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null,res);
  });
}

function totalCommunity (cb) {
  var sql = "SELECT COUNT(community_id) as CommCount FROM `dz_community`";
  connection.query(sql,(err, results) => {
   
      if (err) {
        cb(err);
        return;
      }
      cb(null,results);
    });
}

function totalDishmizer (cb) {
  var sql = "SELECT COUNT(user_id) as dishmizerCount FROM `dz_user` WHERE active = 1";
  connection.query(sql,(err, results) => {
   
      if (err) {
        cb(err);
        return;
      }
      cb(null,results);
    });
}

function countTopic (cb) {
  var query = connection.query(
     'SELECT COUNT(meta_id) AS totalTopic FROM dz_meta WHERE content_type="community"',
     (err, results) => {
       if (err) {
         //cb(err);
         return;
       }
       cb(null, results);
     }
   );
 }


module.exports = {
  createSchema: createSchema,
  fetchCommunity:fetchCommunity,
  totalCommunity:totalCommunity,
  totalDishmizer:totalDishmizer,
  countTopic:countTopic,
  create:create
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
