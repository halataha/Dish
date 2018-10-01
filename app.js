'use strict';


const path = require('path');
const express = require('express');
const flash = require('express-flash-notification');
const session = require('express-session');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const passport = require('passport');
const multer = require('multer');
const Pusher = require('pusher');
const config = require('./config');
const nodemailer = require('nodemailer');
const app = express();

app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);

//app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use('/public', express.static('public'));
//app.use( express.static( "recipephotos" ) );
app.use( express.static( "blogphotos" ) );
//app.use( express.static( "userphotos" ) );
const sessionConfig = {
  resave: true,
  saveUninitialized: true,
  secret: 'DishmizeSecret',
  //signed: true,
  //cookie:{maxAge:600000}
};


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session(sessionConfig));


const flashNotificationOptions = {
  beforeSingleRender: function(item, callback) {
    if (item.type) {
      switch(item.type) {
        case 'success':
          item.alertClass = 'alert-success';
          break;
        case 'error':
          item.alertClass = 'alert-danger';
          break;
      }
    }
    callback(null, item);
  }
};

// Flash Notification Middleware Initialization
app.use(flash(app, flashNotificationOptions))

app.use('/login', require('./login/crud'));
app.use('/registration', require('./registration/crud'));
app.use('/home', require('./home/crud'));
app.use('/recipes', require('./recipes/crud'));
app.use('/blog', require('./blog/crud'));
app.use('/dishmizer', require('./dishmizer/crud'));
app.use('/single-recipes', require('./single-recipes/crud'));
app.use('/single-blog', require('./single-blog/crud'));
app.use('/dishmizer-profile', require('./dishmizer-profile/crud'));
app.use('/contact-us', require('./Contact-Us/crud'));
app.use('/community', require('./community/crud'));
app.use('/single-topic', require('./single-topic/crud'));
app.use('/about-us', require('./about-us/crud'));
app.use('/earn-money', require('./earn-money/crud'));
app.use('/error', require('./error/crud'));
app.use('/terms-and-conditions', require('./terms-and-conditions/crud'));


//app.use('/api/books', require('./books/api'));

// Redirect root to /books
app.get('/', (req, res) => {
  res.redirect('/home');
});


//app.use(logging.errorLogger);
// Basic 404 handler
app.use((req, res) => {
//  res.status(404).redirect('/error/404');
});


// Basic error handler
app.use((err, req, res, next) => {
  /* jshint unused:false */
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
//  res.status(500).send(err.response || 'Somethng Went Wrong. Try Again.');
//    res.status(500).redirect('/error/500');
});
// [END errors]

if (module === require.main) {
  // Start the server
    const server = app.listen(config.get('PORT'), () => {
    const port = server.address().port;
    console.log(`Dishmize New Ready To Attack! on port ${port}`);
  });
}


module.exports = app;

