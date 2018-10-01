'use strict';

const express = require('express');
const images = require('../lib/images');

function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});


router.get('/:community_id', (req, res, next) => {
    
    if(req.session.user_id == undefined ){
  	req.flash('error','Login First.','/login');
  	return
    }

var page = 1
var limit = 5;
var p = (page == 1 || page == 0 ) ? page*0 : page*limit - limit;

getModel().countPost(req.params.community_id,(err, countPost) => {	
	getModel().single_topic(limit,p,req.params.community_id,(err, entities) => {
  			if (err) {

				next(err);
				return;
				}

		     	res.render('pages/single-topic', { 
				title:"Single-Topic", 
				data: entities ,
				current: page,
				id: req.params.community_id,
				countPost:countPost.total,
                pages: Math.ceil(countPost.total / limit),
                sess_val: req.session.user_id

			});
		});
    });
});


router.get('/:community_id/:page', (req, res, next) => {
var page = req.params.page || 1;
var limit = 5;
var p = (page == 1 || page == 0 ) ? page*0 : page*limit - limit;
getModel().countPost(req.params.community_id,(err, countPost) => {	
	getModel().single_topic(limit, p,req.params.community_id,(err, entities) => {
			if (err) {
				next(err);
				return;
				}

		     	res.render('pages/single-topic', { 
				title:"Single-Topic", 
				data: entities ,
				current: page,
				id: req.params.community_id,
				countPost:countPost,
                pages: Math.ceil(countPost.total / limit),
                sess_val: req.session.user_id
			});
		});
  });
});



module.exports = router;


