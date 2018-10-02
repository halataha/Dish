'use strict';

const express = require('express');
const images = require('../lib/images');

function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

router.get('/', (req, res, next) => {
var page = 1
var limit = 8;
var p = (page == 1 || page == 0 ) ? page*0 : page*limit - limit;
getModel().countDishmizer((err, countDishmizer) => {	
	getModel().dishmizer(limit, p, (err, dishmizer) => {
			if (err) {
				next(err);
				return;
				}
				console.log(dishmizer);
		     	res.render('pages/dishmizer', { 
				title:"Dishmizer", 
				data: dishmizer ,
				current: page,
                pages: Math.ceil(countDishmizer.total / limit),
                sess_val: req.session.user_id
                
			});
		});
    });
});


router.get('/:page', (req, res, next) => {
var page = (req.params.page !== '') ? req.params.page : 1;
var limit = 8;
var p = (page == 1 || page == 0 ) ? page*0 : page*limit - limit;
getModel().countDishmizer((err, countDishmizer) => {	
	getModel().dishmizer(limit, p, (err, dishmizer) => {

			if (err) {
				next(err);
				return;
				}

			 	res.render('pages/dishmizer', { 
				title:"Dishmizer", 
				data: dishmizer ,
				current: page,
                pages: Math.ceil(countDishmizer.total / limit),
                sess_val: req.session.user_id
			});
		});
     });
});


module.exports = router;


