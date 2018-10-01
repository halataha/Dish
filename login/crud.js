'use strict';

const express = require('express');
const images = require('../lib/images');
const nodemailer = require('nodemailer');
const config = require('../config');



function getModel() {
    return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.get('EMAIL_SENDING_USER'),
        pass: config.get('EMAIL_SENDING_PASS')
    }
});

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});



router.get('/', (req, res, next) => {
    var cookie_val = req.cookies.cookieName;
    res.render('pages/login', {
        title: "Login",
        sess_val: req.session.user_id,
        cookie_val: cookie_val,
        remember_me:req.cookies.remember_me
    });
});

router.post('/', (req, res, next) => {

    var username = req.body.username;
    var password = req.body.password;
    var remember_me = req.body.remember_me;

    if (remember_me == true) {

        res.cookie('cookieName', username, {
            maxAge: 900000,
            httpOnly: true
        });
        res.cookie('remember_me', remember_me, {
            maxAge: 900000,
            httpOnly: true
        });

    }else{
        res.clearCookie('cookieName');
        res.clearCookie('remember_me');
    }

    getModel().loginUser(username, password, (err, entities) => {
        if (err == 'err') {
            var ent = {};
            ent['msg'] = entities;
            ent['loginstatus'] = 'error';
            res.send(JSON.stringify(ent));
            return;
        } else {
            req.session.user_id = entities[0].user_id;
            req.session.email = entities[0].email;
            req.session.firstname = entities[0].firstname;
            req.session.lastname = entities[0].lastname;
            req.session.imageUrl = entities[0].imageUrl;
            entities[0].loginstatus = 'success';
            res.send(JSON.stringify(entities[0]));
            //res.redirect('/dishmizer-profile/'+entities[0].user_id+'');
        }
    });
});


router.post('/changePassword', (req, res, next) => {
    

    var queryString = Buffer.from(req.body.email).toString('base64');
    var randomNum = Math.floor(100000 + Math.random() * 900000);

    getModel().checkEmail_Exists(req.body.email, (err, savedData) => {

        if (err) {
            next(err);
            return;
        } else if (savedData.length > 0) {

            var data = {
                'status': randomNum
            };
            getModel().update_num(req.body.email, data, (err, savedData) => {
                if (err) {
                    next(err);
                    return;
                }

                var mailOptions = {
                    from: config.get('EMAIL_FROM'),
                    to: req.body.email,
                    subject: 'Forgot Password | Dishmize',
                    text: 'Hello, Please go to this link for reset your password ' + req.headers.origin + '/login/Password_setting/?con=' + queryString + '&token=' + randomNum
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        res.send({'status': 'danger','msg':'Error in Sending Email. Please try again'});
                        return;
                    } else {

                        res.send({'status': 'success','msg':'The reset Password link sent on your email address, please check your Email.'});
                        return;
                    }
                });

            });
        } else {
            res.send({'status': 'danger','msg':'Email Id does not exists.'});
        }
    });
});

router.get('/Password_setting', (req, res, next) => {
    var email = Buffer.from(req.query.con, 'base64').toString('ascii');
    var token = req.query.token;
    var data = {
        'email': email,
        'token': token
    };
    res.render('pages/forgotPassword', {
        title: "Change Password",
        sess_val: req.session.user_id,
        data: data
    });
});

router.post('/Password_setting', (req, res, next) => {

    var data = {
        'password': req.body.password,
        'confirmpassword': req.body.confirm_password
    };

    getModel().update_password(req.body.emailP, req.body.token, data, (err, savedData) => {
        if (err || savedData == undefined) {
            res.send({'status':'danger','msg':'Link expired. Please generate again.'});
        } else if (savedData == 'Done') {
            res.send({'status':'success','msg':'Password Changed Successfully.'});
        }

    });
});

router.post('/resendLink', (req, res, next) => {

    var email = req.body.email;

    getModel().checkUser_Email(email, (err, entities) => {

        if (err) {
            res.send('error');
            return;
        } else if (entities.active == 1) {
            res.send('You are verified user, please login.');
        } else {

            var queryString = Buffer.from(email).toString('base64');
            var mailOptions = {
                from: config.get('EMAIL_FROM'),
                to: email,
                subject: 'Email Verification | Dishmize',
                text: 'Hello, Thanks for signing up on Dishmize ' + req.headers.origin + '/registration/statusChange_email/?con=' + queryString
            };
            console.log(mailOptions);
            transporter.sendMail(mailOptions, function (error, info) {
                console.log(error);
                if (error) {
                    res.send('Error in Sending Email. Please try again');
                    console.log(error);
                    return;
                } else {
                    res.send('Verification Link send on given email. please check it.');
                    return;
                }
            });
        }
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


module.exports = router;
