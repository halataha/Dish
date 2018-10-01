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

function recipesUser (limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    'SELECT dr.recipe_id,dr.user_id,dr.recipe_image,dr.recipe_title,dr.description,du.firstname,du.lastname,du.email,du.imageUrl,dl.like_id,dl.status as likeStatus,(select count(like_id) FROM dz_like WHERE content_type_id=dr.recipe_id AND status = 1) AS like_count,(select count(comment_id) FROM dz_comment WHERE content_type_id=dr.recipe_id) AS comment_count, (select AVG(rating) as rating from dz_rating where content_type_id = dr.recipe_id) as rating FROM dz_recipes dr LEFT JOIN dz_user du ON du.user_id = dr.user_id LEFT JOIN dz_like dl ON dl.content_type_id = dr.recipe_id ORDER BY dr.last_update DESC LIMIT ? OFFSET ?', [limit, token],
    (err, results) => {
   
      if (err) {
        cb(err);
        return;
      }
  
      const hasMore = results.length === limit ? token + results.length : false;
      cb(null, results, hasMore);
    }
  );
}


function totalRecipe (cb) {
  var sql = "SELECT COUNT(recipe_id) as recipeCount FROM `dz_recipes`";
  connection.query(sql,(err, results) => {
   
      if (err) {
        cb(err);
        return;
      }
      cb(null,results);
    });
}


function totalDishmizer (cb) {
  var sql = "SELECT COUNT(user_id) as dishmizerCount FROM dz_user WHERE active = 1";
  connection.query(sql,(err, results) => {
   
      if (err) {
        cb(err);
        return;
      }
      cb(null,results);
    });
}

function totalPhotos (cb) {
  var sql = "SELECT COUNT(recipe_image) as recipeImage,(SELECT COUNT(image_blog) FROM dz_blog ) as blogImage FROM `dz_recipes`";
  connection.query(sql,(err, results) => {
   
      if (err) {
        cb(err);
        return;
      }
      cb(null,results);
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

function totalComment (cb) {
  var sql = "SELECT COUNT(comment_id) as commentCount FROM `dz_comment`";
  connection.query(sql,(err, results) => {
   
      if (err) {
        cb(err);
        return;
      }
      cb(null,results);
    });
}

function totalBlog (cb) {
  var sql = "SELECT COUNT(blog_id) as blogCount FROM `dz_blog`";
  connection.query(sql,(err, results) => {
   
      if (err) {
        cb(err);
        return;
      }
      cb(null,results);
    });
}


function recipeOftheDay (cb) {
  connection.query(
    
    'select r.recipe_image,r.recipe_id,r.recipe_title,r.description,u.imageUrl,u.user_id,u.firstname,u.lastname,m.content_description from dz_recipes r left join dz_user u On r.user_id = u.user_id left join dz_meta m On u.user_id = m.user_id ORDER BY r.last_update DESC LIMIT ?', [1],
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null, results);
    }
  );
}


function blog (limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    'select * from dz_blog LIMIT ? OFFSET ?', [limit, token],
    (err, results) => {
      
      if (err) {
        cb(err);
        return;
      }
      const hasMore = results.length === limit ? token + results.length : false;
      cb(null, results, hasMore);
    }
  );
}


function listBy (userId, limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    'SELECT * FROM `books` WHERE `createdById` = ? LIMIT ? OFFSET ?',
    [userId, limit, token],
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      const hasMore = results.length === limit ? token + results.length : false;
      cb(null, results, hasMore);
    });
}


function byCategory (categoryId, limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  connection.query(
    
    'select * from `dz_recipes` r left join dz_user u On r.user_id = u.user_id WHERE `category_id` = '+categoryId+' ORDER BY r.last_update DESC LIMIT ? OFFSET ?',
    [limit, token],
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      const hasMore = results.length === limit ? token + results.length : false;
      cb(null, results, hasMore);
    });
}

function create (data, cb) {
  connection.query('INSERT INTO `dz_user` SET ?', data, (err, res) => {
    if (err) {
      cb(err);
      return;
    }
    read(res.insertId, cb);
  });
}

function read (category, cb) {
  connection.query(
    'SELECT * FROM `dz_category` WHERE `name` = ?', category, (err, results) => {
      if (!err && !results.length) {
        err = {
          code: 404,
          message: 'Not found'
        };
      }
      if (err) {
        cb(err);
        return;
      }
      cb(null, results[0]);
    });
}


function getCategory (category, cb) {
  connection.query(
    'SELECT * FROM `dz_category` WHERE `name` = ?', category, (err, results) => {
      if (!err && !results.length) {
        err = {
          code: 404,
          message: 'Not found'
        };
      }
      if (err) {
        cb(err);
        return;
      }
      cb(null, results[0]);
    });
}

function update (id, data, cb) {
  connection.query(
    'UPDATE `books` SET ? WHERE `id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      read(id, cb);
    });
}

function _delete (id, cb) {
  connection.query('DELETE FROM `books` WHERE `id` = ?', id, cb);
}
function getParchesedRecipe(user_id, cb){
    if(user_id){
       connection.query('select recipe_id from `dz_transaction` where `user_id` = ?', user_id ,(err, results) => {
           if (err) {
               cb(err);
               return;
           }
           
           var ids = [];
           for(var i = 0;i< results.length; i++){
               ids.push(results[i].recipe_id);
           }
           cb(null, ids);
       });
    }else{
        cb(null, []);
    }
    
}

module.exports = {
  createSchema: createSchema,
  recipesUser: recipesUser,
  blog: blog,
  listBy: listBy,
  create: create,
  totalRecipe:totalRecipe,
  read: read,
  update: update,
  totalPhotos:totalPhotos,
  totalDishmizer:totalDishmizer,
  delete: _delete,
  totalBlog:totalBlog,
  totalCommunity:totalCommunity,
  byCategory:byCategory,
  totalComment:totalComment,
  getCategory:getCategory,
  recipeOftheDay:recipeOftheDay,
    getParchesedRecipe:getParchesedRecipe
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
