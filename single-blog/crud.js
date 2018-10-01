'use strict';

const express = require('express');
const images = require('../lib/images');

function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();
var dt = convertDate(new Date());
// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});


router.get('/:blog_id', (req, res, next) => {
    if(req.session.user_id == undefined ){
        req.flash('error','Login First.','/login');
        return
    }
	getModel().single_blog(req.params.blog_id , (err, singleData,scount) => {
		getModel().commentData(req.params.blog_id , (err, cData,count) => {

			if (err) {
				next(err);
				return;
				}
        console.log(cData); 
        res.render('pages/blog_single', { 
				title:"Single-Blog", 
				data: singleData,
				commentData:cData,
				countData:count,
				session_values: {
					'user_id': req.session.user_id,
					'email': req.session.email,
					'firstname': req.session.firstname,
					'lastname': req.session.lastname,
					'image': req.session.imageUrl
			},
				sess_val: req.session.user_id
			});
		});
    });
});

router.post('/comment/:blog_id', (req, res, next) => {
	if (req.session.user_id == undefined) {
			res.send('error');
			return
	}
	var cData = {
			'user_id': req.session.user_id,
			'content_type': 'blog',
			'content_type_id': req.params.blog_id,
			'comment': req.body.comment,
			'name': req.body.name,
			'email': req.body.email,
			'parent_id': 0,
			'date': dt,
			'status': 1,
			'active': 1,
			'is_delete': 1
	}

	getModel().create(cData, 'dz_comment', (err, savedData) => {
		if (err) {
					res.send('error');
					next(err);
					return;
			}
			res.send('success');
	});
});

router.post('/:comment_id/:blog_id/parentCom', (req, res, next) => {
	if (req.session.user_id == undefined) {
			res.send('error');
			return
	}

	var pData = {
			'user_id': req.session.user_id,
			'content_type': 'blog',
			'content_type_id': req.params.blog_id,
			'comment': req.body.commentblogCommodel,
			'name': req.body.nameblogCommodel,
			'email': req.body.emailblogCommodel,
			'parent_id': req.params.comment_id,
			'date': dt,
			'status': 1,
			'active': 1,
			'is_delete': 1
	}

	getModel().create(pData, 'dz_comment', (err, savedData) => {
			if (err) {
					next(err);
					return;
			}
			res.send(JSON.stringify(savedData));

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


