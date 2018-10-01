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

function loginUser (username,password,cb) {

  var sql = "SELECT * FROM `dz_user` WHERE (username = '"+username+"' OR email = '"+username+"') AND password = '"+password+"' AND confirmpassword = '"+password+"'";
  var query = connection.query(sql, (err, results) => {
  if (err) {
      var err_msg = "Error Occured";
      cb('err',err_msg);
      return;
      }
  
  else{
      if(results.length > 0){

          if( password === results[0].password && (username === results[0].username || username === results[0].email ) ){
            if (results[0].active == 0){
          var err_msg = "You need to Verify account first !";
          cb( 'err', err_msg); 
          return; 
          }else{
          results.msg = "Login Successfull !";
          cb('success', results);
          }
          }else {
          var err_msg = "Incorrect Username OR Password !";
          cb( 'err', err_msg);  
          return;
          }
       }  
      else{
          var err_msg = "Username does not exits !";
          cb('err' , err_msg);
          return;
          }
       }
    });
}



function checkUser_Email (email, cb) {
  connection.query(
    'SELECT * FROM `dz_user` WHERE `email` = ?', email, (err, results) => {
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



function read (id, cb) {
  connection.query(
    'SELECT * FROM `books` WHERE `id` = ?', id, (err, results) => {
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


function update_num (email, data, cb) {
  connection.query(
    'UPDATE `dz_user` SET ? WHERE `email` = ?', [data, email], (err) => {
      if (err) {
        cb(err);
        return;
      }
      cb(null,'Done');
    });
}


function checkEmail_Exists (email,cb) {
  connection.query(
    "SELECT email FROM `dz_user` where `email`='"+email+"'",
    (err, results) => {
      
      if (err) {
        cb(err);
        return;
      }
      
      cb(null, results);
    }
  );
}


function update_password (email,token,data, cb) {
  var query = connection.query(
    "UPDATE dz_user SET `password` = '"+data.password+"', `confirmpassword`='"+data.confirmpassword+"' WHERE `email` = '"+email+"' AND `status` = "+token+"", (err,res) => {
         
            if (err) {
              cb(err);
              return;
            }

        if(res.affectedRows > 0){

         connection.query(
          "UPDATE `dz_user` SET `status`= 'NULL' WHERE `email` = '"+email+"'",  (err) => {
            if (err) {
              cb(err);
              return;
            }
              cb(null,'Done');   
         });  
        }else if(res.affectedRows === 0){
         cb(err);
              return; 
        }          
   });

}



module.exports = {
  createSchema: createSchema,
  loginUser: loginUser,
  read: read,
  checkUser_Email,
  update_num:update_num,
  checkEmail_Exists:checkEmail_Exists,
  update_password:update_password
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


