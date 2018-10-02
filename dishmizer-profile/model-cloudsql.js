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

function profileData (id,cb) {

var sql = "select u.firstname,u.user_id,u.username,u.lastname,u.imageUrl,u.email,m.con_key,m.value,m.content_description from dz_meta m left join dz_user u On m.user_id = u.user_id where u.user_id = '"+id+"' and m.content_type_id = '"+id+"' and (m.content_type = 'dishmizer-profile' or m.content_type = 'dishmizer') ";
  var query = connection.query(sql,(err, results) => {
      if (err) {
        cb(err);
        return;
  }
      cb(null, results,null);
  });

}


function updateUserdata (id, data, cb) {
  var query = connection.query('UPDATE `dz_user` SET ? WHERE `user_id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
     // cb(id, cb);
    });
}


function updateMetaDdata (id, data, cb) {
  
  console.log('data')
  console.log(data);

var query = connection.query('UPDATE `dz_meta` SET ? WHERE `content_type`="dishmizer" and `con_key`="profile_comment" and `content_type_id`= '+id+' and `user_id` = ?', [data, id], (err) => {
      if (err) {
        cb(err);
        return;
      }
      //cb(id, cb);
    });
}


function updateUser_mdata (id,key,value,cb) {
 var query = connection.query("UPDATE `dz_meta` SET `value`='"+value+"' WHERE `content_type`='dishmizer-profile' and `con_key`='"+key+"' and content_type_id= "+id+" and `user_id` = "+id+"",(err) => {
      if (err) {
        cb(err);
        return;
      }
     //cb(id, cb);
    });
}

function recipeData (id, start, end, cb) {

 //var sql = "select count(r.recipe_id) as recipe_count,r.recipe_image,r.recipe_id,r.recipe_title from dz_recipes r where r.user_id = '"+id+"' ORDER BY r.last_update DESC  LIMIT 3";
 var sql = "SELECT dr.recipe_id,dr.user_id,dr.recipe_image,dr.recipe_title,dr.description,du.firstname,du.lastname,du.email,du.imageUrl,dl.like_id,dl.status as likeStatus,(select count(like_id) FROM dz_like WHERE content_type_id = dr.recipe_id AND status = 1) AS like_count,(select count(recipe_Id) FROM dz_recipes where user_id = dr.user_id) AS recipeCount,(select count(comment_id) FROM dz_comment WHERE content_type_id = dr.recipe_id) AS comment_count, (select AVG(rating) as rating from dz_rating where content_type_id = dr.recipe_id) as rating, (select count(*) FROM dz_recipes WHERE user_id = "+id+") as count FROM dz_recipes dr LEFT JOIN dz_user du ON  dr.user_id = du.user_id  LEFT JOIN dz_like dl ON dr.recipe_id = dl.content_type_id  WHERE dr.user_id = "+id+" ORDER BY dr.last_update DESC LIMIT "+start+", "+end+" ";
 var query =  connection.query(sql,(err, results) => {
      if (err) {
        cb(err);
        return;
  }
      var numRows = results.length;
      cb(null, results,numRows);
    }
  );
    
}

function userData (id,cb) {

var sql = "select * from `dz_user` where user_id = '"+id+"'";

 var query = connection.query(sql,(err, results) => {
      if (err) {
        cb(err);
        return;
  }
      cb(null, results);
    }
  );

}


function postData (id, start, end, cb) {

var sql = "select b.image_blog,b.blog_id,b.title,b.description,b.date,DAY(b.date) as day,MONTHNAME(b.date) as month , YEAR(b.date) as year,(SELECT count(comment_id) FROM dz_comment WHERE content_type_id = b.blog_id) AS comment_count FROM dz_blog b WHERE b.user_id = '"+id+"' ORDER BY b.last_update DESC LIMIT "+start+", "+end+"";

 var query = connection.query(sql,(err, results) => {
      if (err) {
        cb(err);
        return;
  }
      var numRows = results.length;
      cb(null, results,numRows);
    }
  );
}


function addProfile (data, cb) {
  var query = connection.query('INSERT INTO `dz_meta` SET ?', data, (err, res) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null,res);
  });
}

function checkRating(id, dishmizer_id , table, coloum, coloum1 , cb) {
    
    var query = connection.query("SELECT * FROM " + table + " WHERE " + coloum + " = "+id+" AND "+coloum1+" = "+dishmizer_id+" AND `content_type` = 'dishmizer'", (err, results) => {
        if (!err && !results.length) {
            (null, '404');
        }
        if (err) {
            cb(err);
            return;
        }
        cb(null, results[0]);
    });
    
}
function addRating(data, table, cb) {
    var query = connection.query('INSERT INTO ' + table + ' SET ?', data, (err, res) => {
        if (err) {
            cb(err);
            return;
        }
        cb(null, res);
    });
    
    
}
function updateRating(rid, uid, dishmizer_id, data, cb) {
    var query = connection.query(
    "UPDATE `dz_rating` SET ? WHERE `rate_id` = ? AND `user_id` = ? AND `content_type_id` = ? AND `content_type` = 'dishmizer'", [data, rid, uid, dishmizer_id], (err) => {
        if (err) {
            cb(err);
            return;
        }
        cb(null, 'done');
    });
    
    
}

module.exports = {
profileData:profileData,
recipeData:recipeData,
postData:postData,
userData:userData,
addProfile:addProfile,
updateUserdata:updateUserdata,
updateMetaDdata:updateMetaDdata,
updateUser_mdata:updateUser_mdata,
checkRating:checkRating,
addRating:addRating,    
updateRating:updateRating    
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
      
      connection.end();
    }
  );
}
