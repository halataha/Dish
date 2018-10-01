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

function single_recipe(id, cb) {

    //console.log('single_recipe');
    //last querry  select r.recipe_id,u.user_id,r.recipe_image,r.recipe_title,r.description,r.ordinary_price,r.exclusive_price,r.buy_price,r.category_id,u.firstname,u.lastname,u.imageUrl,m.meta_id,m.con_key,m.value,m.content_type,m.content_description,m.content_type_id from dz_recipes r left join dz_user u On r.user_id = u.user_id left join dz_meta m On m.content_type_id = r.recipe_id where (m.content_type = 'recipe' OR m.content_type = 'dishmizer' ) AND r.recipe_id = '" + id + "'"
    var sql = "select r.recipe_id,u.user_id,r.recipe_image,r.recipe_title,r.description,r.ordinary_price,r.exclusive_price,r.buy_price,r.category_id,u.firstname,u.lastname,u.imageUrl,m.meta_id,m.con_key,m.value,m.content_type,m.content_description,m.content_type_id from dz_recipes r left join dz_user u On r.user_id = u.user_id left join dz_meta m On m.content_type_id = r.recipe_id where (m.content_type = 'recipe' OR m.content_type = 'dishmizer' ) AND r.recipe_id = '" + id + "'";
    connection.query(sql, (err, results) => {
       console.log('comment');
        console.log(err);
       //console.log(err);
        var sqlforcat = "select name from dz_category where category_id = '" + results[0].category_id + "'";
        var query = connection.query(sqlforcat, (err, res) => {
            if (err) {
                cb(err);
                return;
            }
        
            cb(null, results, res);
        });
    });
}

function commentData(id, cb) {

    var sql = "select * from dz_comment c left join dz_user u ON c.user_id = u.user_id where content_type = 'recipe' and content_type_id = '" + id + "' ORDER BY c.last_update";
    connection.query(sql, (err, commentData) => {
        if (err) {
            cb(err);
            return;
        } else {
            var sql1 = "select AVG(rating) as rating from dz_rating where content_type = 'recipe' and content_type_id = '" + id + "'";
            connection.query(sql1, (err, ratingData) => {
                if (err) {
                    cb(err);
                    return;
                }
                
                var rating = ratingData ? ratingData[0].rating : 0;
                var obj = {commentData:commentData,rating:rating};
                var numRows = commentData.length;
                cb(null, obj, numRows);
            });
          }
        /*var numRows = results.length;
        cb(null, results, numRows);*/
    });
}

function checkBuyer(recId,user_id,cb) {

    var sql = 'SELECT t.recipe_id,t.user_id FROM dz_transaction t WHERE recipe_id= '+recId+' AND user_id = '+user_id+'';
    var q = connection.query(sql, (err, results) => {
        if (err) {
            cb(err);
            return;
        }
        cb(err, results);
    });

    
}


function create(data, table, cb) {
    var query = connection.query('INSERT INTO ' + table + ' SET ?', data, (err, res) => {
        if (err) {
            cb(err);
            return;
        }
        cb(null, res);
    });
    console.log(query.sql);
}

function read(id, recipeId , table, coloum, coloum1 , cb) {
    var query = connection.query(
        'SELECT * FROM ' + table + ' WHERE ' + coloum + ' = '+id+' AND '+coloum1+' = '+recipeId+'', (err, results) => {
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


function update(rid, uid, recId, data, cb) {
    var query = connection.query(
        "UPDATE `dz_rating` SET ? WHERE `rate_id` = ? AND `user_id` = ? AND `content_type_id` = ? AND `content_type` = 'recipe'", [data, rid, uid, recId], (err) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, 'done');
        });
    
}

module.exports = {
    single_recipe: single_recipe,
    commentData: commentData,
    create: create,
    read: read,
    checkBuyer:checkBuyer,
    update: update
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
