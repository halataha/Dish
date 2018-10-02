'use strict';

const extend = require('lodash').assign;
const mysql = require('mysql');
const config = require('../config');

const options = (config.get('HOST') !== '') ? {
    user: config.get('MYSQL_USER'),
    password: config.get('MYSQL_PASSWORD'),
    database: config.get('DATABASE'),
    host: config.get('HOST')
} : {
    user: config.get('MYSQL_USER'),
    password: config.get('MYSQL_PASSWORD'),
    database: config.get('DATABASE')
}


const connection = mysql.createConnection(options);

function blogUser(limit, token, cb) {
    // token = token ? parseInt(token, 5) : 0;
    connection.query(
        'select *,DAY(b.date) as day,MONTHNAME(b.date) as month , YEAR(b.date) as year from dz_blog b left join dz_user u On b.user_id = u.user_id ORDER BY b.last_update DESC  LIMIT ? OFFSET ?', [limit, token],
        (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, results);
        }
    );
}

function blogBycategory(limit, token,category_id,cb) {
    // token = token ? parseInt(token, 5) : 0;
   // console.log('Error Category');
    console.log(category_id);
    console.log('testtttttttttttt');
    var q = connection.query(
        'SELECT *,DAY(b.date) AS day,MONTHNAME(b.date) AS month , YEAR(b.date) AS year FROM dz_blog b LEFT JOIN dz_user u ON b.user_id = u.user_id WHERE categoty_id= '+category_id+' ORDER BY b.last_update DESC  LIMIT ? OFFSET ?', [limit, token],
        (err, results) => {
            if (err) {
                cb(err);
                console.log('errrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
                console.log(err);
                return;
            }
            cb(null, results);
        }
    );
}

function getBlog(blog_id, cb) {
    var query = connection.query(
        'select * from dz_blog where blog_id = ' + blog_id + '',
        (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, results);
        }
    );

}

function countBlog(status,cb) {
  // console.log('status');
   //console.log(status); 
  
    let sql = (status == null) ? 'SELECT COUNT(*) AS total FROM dz_blog' : 'SELECT COUNT(*) AS total FROM dz_blog WHERE category_id = '+status+'';  
    connection.query(
        sql,
        (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            console.log('result');
            console.log(results[0]);
            cb(null, results[0]);
        }
    );
}


function create(table, data, blog_id, cb) {
    if(blog_id == 0){
        var query = connection.query('INSERT INTO ' + table + ' SET ?', data, (err, res) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, res);
        });
    }else{
        var query = connection.query(
            'UPDATE '+ table +' SET ? WHERE `blog_id` = ?', [data, blog_id], (err) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, []);
        });
    }
    
}

function categoryList (limit, token, cb) {
    token = token ? parseInt(token, 10) : 0;
    connection.query(
      'SELECT c.category_id,c.name FROM `dz_category` c', [limit, token],
      (err, results) => {
        if (err) {
          cb(err);
          return;
        }
        cb(null, results);
      }
    );
  }

function categoryFilter(cb) {
    var query = connection.query(
        'SELECT DISTINCT b.categoty_id,c.category_id,c.name FROM `dz_blog` b left join dz_category c ON b.categoty_id = c.category_id ORDER BY b.last_update DESC', 
        (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            cb(err, results);
        }
    );
}


function deleteBlog(table,id,column,cb){
    connection.query('DELETE FROM '+table+' WHERE '+column+' = ?', id , cb);
}

module.exports = {
    blogUser: blogUser,
    countBlog: countBlog,
    create: create,
    categoryList: categoryList,
    blogBycategory:blogBycategory,
    getBlog: getBlog,
    categoryFilter:categoryFilter,
    deleteBlog:deleteBlog
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

function createSchema(config) {
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
