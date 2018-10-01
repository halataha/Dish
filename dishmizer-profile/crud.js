'use strict';

const express = require('express');
const images = require('../lib/images');


const _ = require('underscore');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const flow = require('flow');
const configPath = path.join(__dirname, '..', "config.json");
AWS.config.loadFromPath(configPath);


function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();



router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});



router.get('/edit', (req, res, next) => {
	getModel().profileData(req.session.user_id , (err, profileData,scount) => {
	if(profileData !== '' ){	
    res.render('pages/dishmizer-edit', { 
				title:"Dishmizer-Edit",
				data: profileData,
				sess_val: req.session.user_id
          });
       }  
    });          	 
});

router.post('/edit',
  images.multer.single('profileImage'),
  images.sendUploadToGCS,
   (req, res, next) => {
	
   const data = req.body;
  // console.log(data);
   var dt = convertDate(new Date()); 	
	
    var uData = {
          'firstname': data.fName,
          'lastname': data.LName,
          'username': data.usrnm
        }

	if(req.body && req.body.imageHdnedit){
        var s3 = new AWS.S3();
        var rand = makeid();
        var s3Bucket = new AWS.S3( { params: {Bucket: 'dishmize'} } );
        var buf = new Buffer(req.body.imageHdnedit.replace(/^data:image\/\w+;base64,/, ""),'base64');
        var data1 = { Key: req.body.fName+rand+'.jpg' , Body: buf };
        var urlParams = { Bucket: 'dishmize', Key: req.body.fName+rand+'.jpg' };

        s3Bucket.putObject(data1, function(err, data1){
            /*if (err) 
            {
                req.flash('error','Something Went Wrong. Try again.','/register/registerUser');
                return next(); 
            }else{
                uData.imageUrl = 'https://s3.us-east-2.amazonaws.com/dishmize/'+req.body.fName+rand+'.jpg';
                next();
            }*/
        });  
        uData.imageUrl = 'https://s3.us-east-2.amazonaws.com/dishmize/'+req.body.fName+rand+'.jpg';
	}


  	var mDdata = {
	'value': req.body.profile_comment,
	'content_description': req.body.description_con
	};

    var mData = [{
	'value': req.body.Favorite_cusine,
	'con_key':'Favorite_cusine'
	},
	{
	'value': req.body.Favorite_appliances,
	'con_key':'Favorite_appliances' 
	},
	{
	'value': req.body.Favorite_spices,
	'con_key':'Favorite_spices'
	}];    
  

 getModel().updateUserdata(req.session.user_id, uData, (err, updateUserdata) => {
    if (err) {
				req.flash('error','Error Occured !')
				next(err);
				return;
			}
  });	

 getModel().updateMetaDdata(req.session.user_id, mDdata, (err, updateMetaDdata) => {
    if (err) {
				req.flash('error','Error Occured !')
				next(err);
				return;
			}
 });

for (var i = mData.length - 1; i >= 0; i--) {
				var key = mData[i]['con_key'];
				var val = mData[i]['value'];
				getModel().updateUser_mdata(req.session.user_id, key,val, (err2, updateUser_mdata) => {
				if (err2) {
				next(err2);
				return;
				}         
			 });
 }
res.redirect(req.baseUrl+'/'+req.session.user_id);
});


router.get('/:user_id', (req, res, next) => {

	if (req.session.user_id) {

    getModel().profileData(req.params.user_id , (err, profileData,scount) => {
		    if (err) {
				next(err);
				return;
		  }else if( profileData == ''){
                
                if(req.session.user_id == req.params.user_id){
                
                    getModel().userData(req.params.user_id ,(err, UserData) => {
			  	    if (err) {
					next(err);
					return;
	                }
					res.render('pages/dishmizer-add', { 
					title:"Dishmizer-Profile",
					data:UserData,
					sess_val: req.session.user_id
					});
		  	      }); 
                }else{
                	res.redirect('/home');
                } 
	    }else{

		getModel().recipeData(req.params.user_id,0,3 , (err, recipeData) => {
			getModel().postData(req.params.user_id,0,3, (err, postData) => {
                
			 	if (err) {
				next(err);
				return;
				}
                console.log('blog data');
                console.log(profileData);
                
	    	    res.render('pages/dishmizer-profile', { 
				title:"Dishmizer-Profile", 
				data: profileData,
				rData:recipeData,
				pData:postData,
				sess_val: req.session.user_id
			  });
		  });
       });
	  }
   });
    } else {
    req.flash('error','Access denied! Please Login First.','/login') ;
    }
});


router.post('/add-profile', (req, res, next) => {
var dt = convertDate(new Date());
const data = [{
'user_id': req.session.user_id,
'con_key': 'Favorite_cusine',
'value': req.body.Favorite_cusine,
'content_type': 'dishmizer-profile',
'content_description': 'no val',
'content_type_id': req.session.user_id,
'date': dt,
'status': 1,
'is_delete': 1
},
{
'user_id': req.session.user_id,
'con_key': 'Favorite_appliances',
'value': req.body.Favorite_appliances,
'content_type': 'dishmizer-profile',
'content_description': 'no val',
'content_type_id': req.session.user_id,
'date': dt,
'status': 1,
'is_delete': 1
},
{
'user_id': req.session.user_id,
'con_key': 'Favorite_spices',
'value': req.body.Favorite_spices,
'content_type': 'dishmizer-profile',
'content_description': 'no val',
'content_type_id': req.session.user_id,
'date': dt,
'status': 1,
'is_delete': 1
},
{
'user_id': req.session.user_id,
'con_key': 'profile_comment',
'value': req.body.profile_comment,
'content_type': 'dishmizer',
'content_description': req.body.description_con,
'content_type_id': req.session.user_id,
'date': dt,
'status': 1,
'is_delete': 1
}
];

for (var i = data.length - 1; i >= 0; i--) {
getModel().addProfile(data[i], (err, savedData) => {
	if (err) {
	req.flash('error','Something Went wrong. Try again.')
	next(err);
	return;
	}
	});
}
res.redirect(req.baseUrl+'/'+req.session.user_id);
});

router.post('/rating', (req, res, next) => {
var dt = convertDate(new Date());
    if (req.session.user_id == undefined) {
        req.flash('error','Something Went wrong. Try again.','/login')
        return
    }
    
    

    getModel().checkRating(req.session.user_id,req.body.userId, 'dz_rating', 'user_id','content_type_id', (err, entity) => {
        
        if (err) {
            var ret = {};
            ret.status = 'error';
            ret.msg = 'Something went wrong. Try again.';
            res.send(ret);
            return;
        } else if (entity !== undefined) {
            
            var ratData = {
                'rating': req.body.rating,
                'date': dt
            };
            getModel().updateRating(entity.rate_id, req.session.user_id, req.body.userId, ratData, (err, savedData) => {
                if (err) {
                    var ret = {};
                    ret.status = 'error';
                    ret.msg = 'Something went wrong. Try again.';
                    res.send(ret);
                    return;
                }
                if (savedData == 'done') {
                    var ret = {};
                    ret.status = 'success';
                    ret.msg = 'Thankyou for Updating rating.';
                    res.send(ret);
                    return;
                }
            });
        } 
        else if (entity == 404 || entity == undefined) {
           
            var ratData = {
                'user_id': req.session.user_id,
                'content_type': 'dishmizer',
                'content_type_id': req.body.userId,
                'rating': req.body.rating,
                'date': dt,
                'status': 1,
                'active': 1,
                'is_delete': 1
            }
            getModel().addRating(ratData, 'dz_rating', (err, savedData) => {
                
                if (err) {
                    var ret = {};
                    ret.status = 'error';
                    ret.msg = 'Something went wrong. Try again.';
                    res.send(ret);
                    return;
                }
                if (savedData.affectedRows > 0) {
                    var ret = {};
                    ret.status = 'success';
                    ret.msg = 'Thankyou for rating.';
                    res.send(ret);
                    return;
                } else {
                    var ret = {};
                    ret.status = 'error';
                    ret.msg = 'Something went wrong. Try again.';
                    res.send(ret);
                    return;
                }
            });
        }
    });
});

router.post('/show_more_recipes', (req, res, next) => {

    console.log('req === ',req.body);
    getModel().recipeData(req.body.userId ,req.body.start ,req.body.end, (err, recipeData) =>{
        if(err){
            next(err);
            return;
        }
        var obj = {recipeData:recipeData,sess_val: req.session.user_id};
        res.send(obj);
//        console.log('recipeData   ===== ',recipeData);
    })
    
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

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
