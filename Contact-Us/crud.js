'use strict';

const express = require('express');
const images = require('../lib/images');
const nodemailer = require('nodemailer');
const config = require('../config');

function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

router.get('/', (req, res, next) => {
    res.render('pages/contact', { 
				title:"Contact Us", 
		        sess_val: req.session.user_id
	  }); 
});


router.post('/contactEmail', (req, res, next) => {
	
	var dt = convertDate(new Date());
	var EmailData = {
	'name':req.body.nameEmailer,
	'email':req.body.emailEmailer,
	'subject':req.body.subject,
	'message':req.body.message,
	'date':dt,
	'status': 1
	}

 	getModel().sendEmail(EmailData, (err, savedData) => {
      if (err) {
        res.send('error');
        return;
    }

    var mailOptions = {
    from: config.get('EMAIL_FROM'),
    to: req.body.emailEmailer,
    subject: 'Thanks For contacting Us | Dishmize',
    text: 'Hello, Thanks for contacting us.'
    };

    sendMail_Verification(res,mailOptions)      
    });


});

module.exports = router;

function convertDate(date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth()+1).toString();
  var dd  = date.getDate().toString();

  var mmChars = mm.split('');
  var ddChars = dd.split('');

  return yyyy + '-' + (mmChars[1]?mm:"0"+mmChars[0]) + '-' + (ddChars[1]?dd:"0"+ddChars[0]);
}

function sendMail_Verification(res,mailOptions)
{
var transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
    user: config.get('EMAIL_SENDING_USER'),
    pass: config.get('EMAIL_SENDING_PASS')
    }
});
transporter.sendMail(mailOptions,function(error, info){
if (error) {
res.send({'status':'danger','msg':'Some thing went wrong. Try Again !'});
return;
} else {
res.send({'status':'success','msg':'Thanks for contacting with Us.'});
return;
}
}); 
}


