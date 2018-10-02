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
  
  token = token ? parseInt(token, 6) : 0;
  var sql = "SELECT dr.recipe_id,dr.user_id,dr.recipe_image,dr.recipe_title,dr.description,du.firstname,du.lastname,du.email,du.imageUrl,dl.like_id,dl.status as likeStatus,(select count(like_id) FROM dz_like WHERE content_type_id=dr.recipe_id AND status = 1) AS like_count,(select count(comment_id) FROM dz_comment WHERE content_type_id=dr.recipe_id) AS comment_count, (select AVG(rating) as rating from dz_rating where content_type_id = dr.recipe_id) as rating FROM dz_recipes dr LEFT JOIN dz_user du ON du.user_id = dr.user_id LEFT JOIN dz_like dl ON dl.content_type_id = dr.recipe_id ORDER BY dr.last_update DESC LIMIT ? OFFSET ? ";
  connection.query(
    sql,[limit, token],(err, results) => {
      if (err) {
        console.log(err);
        cb(err);
        return;
      }
   
      const hasMore = results.length === limit ? token + results.length : false;
      cb(null, results, hasMore);
    }
  );
}


function getLike_status (recipeId,userId,cb) {
  var query = connection.query(
    'SELECT status,content_type_id as recipe_id from `dz_like` WHERE `content_type_id` = '+recipeId+' and `content_type`= "recipe" and `user_id`= '+userId+' ',
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      
      cb(null,results);
      //const count = results.length === limit ? token + results.length : false;
    });
}


function create(table,data, cb) {
   //console.log('add Recipe');
  // console.log('table')
  // console.log(table);
  // console.log('data')
  // console.log(data.rData);
 var query = connection.query('INSERT INTO '+table+' SET ?', data.rData, (err, res) => {
    if (err) {
      cb(err);
      return;
    }
     
     if(data.mData1 != undefined){
         data.mData1.map(function(item,index){item.content_type_id = res.insertId});
         
         createMeta(data.mData1,cb);   
     }else{
         cb(null,res);
     }
  });
    
}



function read (id, cb) {
  connection.query(
    'SELECT recipe_id FROM `dz_recipes` WHERE `recipe_id` = ?', id, (err, results) => {
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


function updateRecipe (id, data, cb) {
    
    var query = connection.query(
    'UPDATE `dz_recipes` SET ? WHERE `recipe_id` = ?', [data.rData, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
        createMeta(data.mData1,cb);
      //read(id, cb);
    });

}


function getCategory (category, cb) {
  //removed querry SELECT * FROM `dz_category` WHERE `name` = ?
  connection.query(
    `SELECT dc.category_id,dr.recipe_id,dr.user_id,dr.recipe_image,dr.recipe_title,
    dr.description,du.firstname,du.lastname,du.email,
    du.imageUrl,dl.like_id,dl.status as likeStatus,(select count(like_id) 
                            FROM dz_like 
                            WHERE content_type_id=dr.recipe_id AND status = 1) AS like_count
    ,			(select count(comment_id) FROM dz_comment WHERE content_type_id=dr.recipe_id) AS comment_count,
          (select AVG(rating) as rating from dz_rating where content_type_id = dr.recipe_id) as rating
     FROM dz_recipes dr LEFT JOIN dz_user du ON du.user_id = dr.user_id 
     LEFT JOIN dz_like dl ON dl.content_type_id = dr.recipe_id  left join dz_category  dc on dr.category_id=dc.category_id
     where dc.name = ?    
    ORDER BY dr.last_update DESC        
    `
    , category, (err, results) => {
      //console.log('result');
      //console.log(results[0]);
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


function checkLike (user_id,content_type_id,content_type,cb) {
  var query = connection.query(
    'SELECT status FROM `dz_like` WHERE `user_id` = ? and `content_type_id` = ? and `content_type` = ?',[user_id,content_type_id,content_type], (err, results) => {
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


function likestatus_update (user_id,content_type_id,content_type,data,cb) {
 var query = connection.query(
    'UPDATE `dz_like` SET ? WHERE `user_id` = ? and `content_type_id` = ? and `content_type` = ?', [data, user_id,content_type_id,content_type], (err) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null,'OK');
    });
}


function recipeEdit (recipeId,userId,cb) {
var sql = "Select r.*,m.user_id,m.con_key,m.value,m.content_description from dz_recipes r left join dz_meta m On m.content_type_id = r.recipe_id and m.user_id = r.user_id  where m.content_type = 'recipe' and r.recipe_id = "+recipeId+" and m.content_type_id = "+recipeId+" and r.user_id= "+userId+"";  
  connection.query(sql,(err, results) => {
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
      cb(null, results);
    });
}


function byCategory (categoryId, limit, token, cb) {
  //console.log(limit)
 // console.log('by category');
 // console.log(categoryId);
  token = token ? parseInt(token, 10) : 0;
  var query = connection.query(
    
    'select * from `dz_recipes` r left join dz_user u On r.user_id = u.user_id WHERE `category_id` = '+categoryId+' ORDER BY r.last_update DESC LIMIT ? OFFSET ?',
    [limit, token],
    (err, results) => {
      
      if (err) {
        console.log(err);
        cb(err);
        return;
      }
      const hasMore = results.length === limit ? token + results.length : false;
     // console.log(hasMore);
      cb(null, results, hasMore);
    });
    
}


function createMeta (data,cb) {
    
    let keys = Object.keys(data[0]);
    let values = data.map( obj => keys.map( key => obj[key]));
    let sql = 'INSERT INTO `dz_meta` (' + keys.join(',') + ') VALUES ?';
    var query = connection.query(sql, [values], function (err, res) {
        if (err) {
            cb(err);
            return;
        }
        cb(null,res);
    });
    
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


function deleteRecipe (recipeId,userId, cb) {
  var query = connection.query('DELETE FROM `dz_meta` WHERE content_type="recipe" and  user_id='+userId+' and `content_type_id` = ?', recipeId, cb);
}

function delete_RecipeAlldata (recipeId,userId,cb) {
  connection.query('DELETE FROM `dz_recipes` WHERE `recipe_id` = ?', recipeId , cb);
     connection.query('DELETE FROM `dz_meta` WHERE content_type="recipe" and  user_id='+userId+' and `content_type_id` = ?', recipeId, cb);
}

function searchRecipes(search_str,cb){
  console.log('hello searchrecipe');
  console.log(search_str);
    var sql = "SELECT dr.recipe_id,dr.user_id,dr.recipe_image,dr.recipe_title,dr.description,du.firstname,du.lastname,du.email,du.imageUrl,dl.like_id,dl.status as likeStatus,(select count(like_id) FROM dz_like WHERE content_type_id=dr.recipe_id AND status = 1) AS like_count,(select count(comment_id) FROM dz_comment WHERE content_type_id=dr.recipe_id) AS comment_count, (select AVG(rating) as rating from dz_rating where content_type_id = dr.recipe_id) as rating FROM dz_recipes dr LEFT JOIN dz_user du ON du.user_id = dr.user_id LEFT JOIN dz_like dl ON dl.content_type_id = dr.recipe_id WHERE dr.recipe_title like '%" +search_str+ "%' GROUP BY dr.recipe_id ORDER BY dr.last_update DESC";
    
    var query = connection.query(
    sql,
    (err, results) => {
      if (err) {
        cb(err);
        return;
      }
      const hasMore = false;
      cb(null, results, hasMore);
    }
  );
    
    
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
  recipesUser: recipesUser,
  categoryList:categoryList,
  create:create,
  createMeta:createMeta,
  getCategory:getCategory,
  byCategory:byCategory,
  recipeEdit:recipeEdit,
  deleteRecipe:deleteRecipe,
  updateRecipe:updateRecipe,
  delete_RecipeAlldata:delete_RecipeAlldata,
  checkLike:checkLike,
  likestatus_update:likestatus_update,
  getLike_status:getLike_status,
    searchRecipes:searchRecipes,
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
