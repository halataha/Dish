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

function single_blog (id,cb) {

var sql = "select u.firstname,u.lastname,u.imageUrl,b.blog_id,b.user_id,b.image_blog,b.title,b.description,b.date,DAY(b.date) as day,MONTHNAME(b.date) as month , YEAR(b.date) as year from dz_blog b left join dz_user u On b.user_id = u.user_id where b.blog_id = '"+id+"'";
  connection.query(sql,(err, results) => {
      if (err) {
        cb(err);
        return;
  }
      cb(null, results,null);
    }
  );
}


function create(data, table, cb) {
  var query = connection.query('INSERT INTO ' + table + ' SET ?', data, (err, res) => {
    if (err) {
          cb(err);
          return;
      }
      cb(err, res);
  });
}

function commentData (id,cb) {

var sql = "select * from dz_comment c left join dz_user u ON c.user_id = u.user_id where content_type = 'blog' and content_type_id = '"+id+"'";
  connection.query(sql,(err, results) => {
      if (err) {
        cb(err);
        return;
  }
      var numRows = results.length;
      cb(null, results,numRows);
    }
  );
}

module.exports = {
single_blog:single_blog,
commentData:commentData,
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
