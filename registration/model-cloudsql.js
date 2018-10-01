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


function checkRegistration(data, cb) {
   
    var query = connection.query('SELECT username,email FROM `dz_user` where `username`= "' + data.username + '" OR `email` = "' + data.email + '"', (err, results) => {
        if (err) {
            
            var err_msg = "Network Error Occured";
            cb('err', err_msg);
            return;
        } else if (results.length > 0) {
            
            var err_msg = "Email OR Username already Exists.";
            cb('err', err_msg);
            return;
        } else {
            
            create(data, cb);
        }
    });
    //console.log(query.sql);
}


function create(data, cb) {
    
    var query = connection.query('INSERT INTO `dz_user` SET ?', data, (err, res) => {
        if (err) {
            
            var err_msg = "Network Error Occured";
            cb('err', err_msg);
            return;
        }
        
        var err_msg = "Thanks for creating an account. To activate your account, please check your email address. Don't forget to check your SPAM folder.";
        cb('success', err_msg);
    });
}

function read(id, cb) {
    connection.query(
        'SELECT * FROM `dz_user` WHERE `user_id` = ?', id, (err, results) => {
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


function update_status(email, data, cb) {
    connection.query(
        'UPDATE `dz_user` SET ? WHERE `email` = ?', [data, email], (err) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, 'Email Verification done Successfully. Now You can login.');
        });
}

function loginGoogle(email, username, cb){
    var sql = "SELECT * FROM `dz_user` WHERE username = '"+username+"' OR email = '"+email+"'";
    
    var query = connection.query(sql, (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, results);
        });
    console.log(query.sql);
    
}

function loginfacebook(email, username, cb){
    var sql = "SELECT * FROM `dz_user` WHERE username = '"+username+"' OR email = '"+email+"'";
    
    var query = connection.query(sql, (err, results) => {
            if (err) {
                cb(err);
                return;
            }
            cb(null, results);
        });
    console.log(query.sql);
    
}

module.exports = {
    createSchema: createSchema,
    create: create,
    read: read,
    checkRegistration: checkRegistration,
    update_status: update_status,
    loginGoogle:loginGoogle,
    loginfacebook:loginfacebook
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
