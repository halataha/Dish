process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
'use strict';
const express = require('express');
const images = require('../lib/images');
const nodemailer = require('nodemailer');
const config = require('../config');


const _ = require('underscore');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const flow = require('flow');
const configPath = path.join(__dirname, '..', "config.json");
var rand22=Math.floor((Math.random() * 9999999999) + 1);
var multer=require('multer');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null,'public/images/userphotos');
	},
	filename: function (req, file, cb) {
		if (file.mimetype === 'image/png') {
			cb(null,+rand22+'.png');
		} else {
			cb(null,+rand22+'.jpg');
		}
	}
});
const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		cb(null, true);
	} else {
		cb(new Error('File Type Is Not Supported !!'), false);
	}
};

const upload = multer({
	storage: storage,
	limits: { fileSize: 1024 * 1024 },
	fileFilter: fileFilter
});

AWS.config.loadFromPath(configPath);

function getModel() {
    return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});


router.get('/', (req, res, next) => {
    res.render('pages/register', {
        title: "Register",
        sess_val: req.session.user_id
    });
});


router.post('/',upload.any(),function(req,res,next){

console.log('file');
console.log(req.files);

var dt = convertDate(new Date());
         const data = {
         'usertype': 'user',
         'level': 0,
         'firstname': req.body.firstname,
         'lastname': req.body.lastname,
         'username': req.body.username,
         'email': req.body.email,
         'password': req.body.password,
         'date': dt,
         'status': 1,
         'confirmpassword': req.body.confirmpassword,
         'check': req.body.check
         };

         if(req.files.length>0)
         {
            data.imageUrl='' + rand22 + '.jpg';
         }

         getModel().checkRegistration(data, (err, savedData) => {
                        if (err == 'err') {
                            req.flash('error', savedData, '/registration');
                            next();
                            return;
                        } else if (err == 'success') {
                          
                            var queryString = Buffer.from(req.body.email).toString('base64');
                            
                            var mailOptions = {
                                from: config.get('EMAIL_FROM'),
                                to: req.body.email,
                                subject: 'Email Verification | Dishmize',
                                text: 'Hello, Thanks for signing up on Dishmize ' + req.headers.origin + '/registration/statusChange_email/?con=' + queryString
                            };
                            console.log('send verification');
                           // mailOptions.ca = [ selfSignedRootCaPemCrtBuffer ];
                            //agentOptions.key = clientPemKeyBuffer;
                           //agentOptions.cert = clientPemCrtSignedBySelfSignedRootCaBuffer;
                            console.log(mailOptions);
                            sendMail_Verification(mailOptions, req, savedData);
                        }
                    });


})


// router.post(
//     '/',
//     images.multer.single('userPhoto'),
//     images.sendUploadToGCS,
//     (req, res, next) => {

        
//         var dt = convertDate(new Date());
//         const data = {
//             'usertype': 'user',
//             'level': 0,
//             'firstname': req.body.firstname,
//             'lastname': req.body.lastname,
//             'username': req.body.username,
//             'email': req.body.email,
//             'password': req.body.password,
//             'date': dt,
//             'status': 1,
//             'confirmpassword': req.body.confirmpassword,
//             'check': req.body.check
//         };

//         if (req.body && req.body.imageHidden) {
//             var s3 = new AWS.S3();
//             var rand = makeid();
//             var s3Bucket = new AWS.S3({
//                 params: {
//                     Bucket: 'dishmize'
//                 }
//             });
//             var buf = new Buffer(req.body.imageHidden.replace(/^data:image\/\w+;base64,/, ""), 'base64');
//             var data1 = {
//                 Key: req.body.firstname + rand + '.jpg',
//                 Body: buf
//             };
//             var urlParams = {
//                 Bucket: 'dishmize',
//                 Key: req.body.firstname + rand + '.jpg'
//             };

//             s3Bucket.putObject(data1, function (err, data1) {
                
//             });
//             data.imageUrl = 'https://s3.us-east-2.amazonaws.com/dishmize/' + req.body.firstname + rand + '.jpg';
//         }

//         getModel().checkRegistration(data, (err, savedData) => {
//             if (err == 'err') {
//                 req.flash('error', savedData, '/registration');
//                 next();
//                 return;
//             } else if (err == 'success') {
              
//                 var queryString = Buffer.from(req.body.email).toString('base64');
                
//                 var mailOptions = {
//                     from: config.get('EMAIL_FROM'),
//                     to: req.body.email,
//                     subject: 'Email Verification | Dishmize',
//                     text: 'Hello, Thanks for signing up on Dishmize ' + req.headers.origin + '/registration/statusChange_email/?con=' + queryString
//                 };
//                 console.log('send verification');
//                // mailOptions.ca = [ selfSignedRootCaPemCrtBuffer ];
//                 //agentOptions.key = clientPemKeyBuffer;
//                //agentOptions.cert = clientPemCrtSignedBySelfSignedRootCaBuffer;
//                 console.log(mailOptions);
//                 sendMail_Verification(mailOptions, req, savedData);
//             }
//         });
//     });


router.get('/statusChange_email', (req, res, next) => {

    var email = Buffer.from(req.query.con, 'base64').toString('ascii');
    var data = {
        'active': 1
    };
    getModel().update_status(email, data, (err, savedData) => {
        if (err) {
            next(err);
            return;
        }
        res.render('pages/emailVerification', {
            title: "Email Verification",
            sess_val: req.session.user_id,
            savedData: savedData
        });
    });
});

router.post('/googleLogin', (req, res, next) => {
    console.log('google');
    var dt = convertDate(new Date());
    const data = {
        'usertype': 'user',
        'level': 0,
        'firstname': req.body.firstname,
        'lastname': req.body.lastname,
        'username': req.body.username,
        'email': req.body.email,
        'password': '',
        'date': dt,
        'status': 1,
        'confirmpassword': '',
        'check': 1,
        'imageUrl':req.body.imageUrl,
        'active':1
    };

    getModel().checkRegistration(data, (err, savedData) => {
        if (err == 'err' && savedData == 'Network Error Occured') {
            req.flash('error', savedData, '/login');
            next();
            return;
        } else{
            getModel().loginGoogle(req.body.email,req.body.username,(err, entities) =>{

                if (err) {
                    res.send('error');
                    return;
                }

                req.session.user_id = entities[0].user_id;
                req.session.email = entities[0].email;
                req.session.firstname = entities[0].firstname;
                req.session.lastname = entities[0].lastname;
                req.session.imageUrl = entities[0].imageUrl;
                entities[0].loginstatus = 'success';
                res.send(JSON.stringify(entities[0]));
            });

        }
    });
    
});


//
router.post('/facebooklogin', (req, res, next) => {
    //console.log('registration crud',req);
     console.log('facebook???');

    var dt = convertDate(new Date());
    const data = {
        'usertype': 'user',
        'level': 0,
        'firstname': req.body.first_name,
        'lastname': req.body.last_name,
        'username': req.body.name,
        'email': req.body.email,
        'password': '',
        'date': dt,
        'status': 1,
        'confirmpassword': '',
        'check': 1,
        'imageUrl':req.body.picture,
        'active':1
    };

    getModel().checkRegistration(data, (err, savedData) => {
        if (err == 'err' && savedData == 'Network Error Occured') {
            req.flash('error', savedData, '/login');
            next();
            return;
        } else{
            getModel().loginfacebook(req.body.email,req.body.username,(err, entities) =>{

                if (err) {
                    res.send('error');
                    return;
                }

                req.session.user_id = entities[0].user_id;
                req.session.email = entities[0].email;
                req.session.firstname = entities[0].first_name;
                req.session.lastname = entities[0].last_name;
                req.session.imageUrl = entities[0].picture;
                entities[0].loginstatus = 'success';
                res.send(JSON.stringify(entities[0]));
            });

        }
    });
    
});



module.exports = router;

function convertDate(date) {
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();

    var mmChars = mm.split('');
    var ddChars = dd.split('');

    return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
}

function sendMail_Verification(mailOptions, req, savedData) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.get('EMAIL_SENDING_USER'),
            pass: config.get('EMAIL_SENDING_PASS')
        }
    });
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('error Send Email');
            console.log(error);
            req.flash('success', savedData, '/login');
            return;
        } else {
            req.flash('success', savedData, '/login');
            return;
        }
    });
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
