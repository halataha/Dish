'use strict';

const express = require('express');
const images = require('../lib/images');

const _ = require('underscore');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const flow = require('flow');
const configPath = path.join(__dirname, '..', "config.json");
var rand22=Math.floor((Math.random() * 9999999999) + 1);
AWS.config.loadFromPath(configPath);
//multer try
// var multer=require('multer');
// const storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, 'public/images/recipephotos');
// 	},
// 	filename: function (req, file, cb) {
// 		if (file.mimetype === 'image/png') {
// 			cb(null,+rand22+'.png');
// 		} else {
// 			cb(null,+rand22+'.jpg');
// 		}
// 	}
// });
// const fileFilter = (req, file, cb) => {
// 	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
// 		cb(null, true);
// 	} else {
// 		cb(new Error('File Type Is Not Supported !!'), false);
// 	}
// };

// const upload = multer({
// 	storage: storage,
// 	limits: { fileSize: 1024 * 1024 },
// 	fileFilter: fileFilter
// });




function getModel() {
    return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();


// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});

router.get('/', (req, res, next) => {
    //console.log('body');
    //console.log(req.query);

    getModel().recipesUser(12, req.query.pageToken, (err, dataUser, cursor) => {
                
        if (err) {
            console.log('errrrr');
            next(err);
            return;
        }

        getModel().getParchesedRecipe(req.session.user_id, (err , recipeids) =>{
         //console.log('recibes');
         //console.log(recipeids);
         recipeids=[];

            res.render('pages/recipes', {
                title: "Recipes",
                data: dataUser,
                nextPageToken: cursor,
                sess_val: req.session.user_id,
                recipeids:recipeids    
            });
        });
    });
});

router.get('/Add', (req, res, next) => {
   // console.log('add Recipe');
    //console.log(req.session.user_id);
    if (req.session.user_id == undefined) {
        req.flash('error', 'Access denied! Please Login First.', '/login');
    } else {
        
        getModel().categoryList(null, null, (err, entities) => {
            //console.log('mycat');
            //console.log(err);
            res.render('pages/create-recipe', {
                title: "Create-recipe",
                action: 'Add',
                categoryList: entities,
                RecipeData: 0,
                sess_val: req.session.user_id
            });
        });
    }
});


//my add recipe

// router.post('/Add',upload.any(),function(req,res,next){
    
//     //  res.render('index',{title:'express'});
//     //console.log('hello');
    
//     //res.send('Welcome Post Success');
   
//     //console.log(req);
   
   
//    //res.send('hello');
//    console.log(req.files);
//    var data=req.body;
//    console.log('data');
//    console.log(data);
//    var dt = convertDate(new Date());
//    console.log(dt);
//    //var rand=Math.floor((Math.random() * 9999999999) + 1)+''+ Math.floor((Math.random() * 9999999999) + 1)+''+Math.floor((Math.random() * 9999999999) + 1)+''+Math.floor((Math.random() * 9999999999) + 1);  

//    var rData = {
//       'recipe_title': data.recipetitle,
//      'description': data.description,
//      'category_id': data.category,
//      'ordinary_price':data.ordinary_price,
//      'exclusive_price':data.exclusive_price,
//      'buy_price':data.buy_price,
//      'user_id': req.session.user_id,
//      'status': 1,
//      'active': 1,
//      'is_delete': 1,
//      'date': dt,
//     // 'recipe_image':'' + rand22 + '.jpg'
//   }
//   if(req.files.length>0)
//   {
//       rData.recipe_image='' + rand22 + '.jpg';
//   }


//  // rData.recipe_image = 'https://s3.us-east-2.amazonaws.com/dishmize/' + rand + '.jpg';

//    console.log('rdata');
//    console.log(rData);

//    add_recipes(rData,data,req,dt,res);
//    console.log('added success');
//   })
  


//router.post('/Add',
////images.multer.single('recipeImage')     
//images.multer.single('recipeImage'),
  //  images.sendUploadToGCS,
    //(req, res, next) => {
       //console.log('upload image');
       //console.log(req.body.imageHiddenRc);
      //  const data = req.body;
        //console.log('all data');
        //console.log(data);
       // var dt = convertDate(new Date());
        //var rData = {
          //  'recipe_title': data.recipetitle,
            //'description': data.description,
            //'category_id': data.category,
            //'ordinary_price':data.ordinary_price,
            //'exclusive_price':data.exclusive_price,
            //'buy_price':data.buy_price,
            //'user_id': req.session.user_id,
            //'status': 1,
            //'active': 1,
            //'is_delete': 1,
            //'date': dt
       // }

         
    
        //if (req.body && req.body.imageHiddenRc) {
           
           // console.log("hello Image"+req.body.imageHiddenRc);
          //  var s3 = new AWS.S3();
           // var rand = makeid();
            //var s3Bucket = new AWS.S3({
              //  params: {
                //    Bucket: 'dishmize'
                //}
            //});
            //var buf = new Buffer(req.body.imageHiddenRc.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            //var data1 = {
             //   Key: rand + '.jpg',
               // Body: buf
            //};
            //var urlParams = {
              //  Bucket: 'dishmize',
                //Key: rand + '.jpg'
            //};
            
           // s3Bucket.putObject(data1, function (err, data1) {
                /*if (err) {
                    req.flash('error', 'Something Went Wrong. Try again.', '/register/registerUser');
                    return next();
                } else {
                    rData.recipe_image = 'https://s3.us-east-2.amazonaws.com/dishmize/' + rand + '.jpg';
                    next();
                }*/
           // });
            //rData.recipe_image = 'https://s3.us-east-2.amazonaws.com/dishmize/' + rand + '.jpg';
        //}
        
    
        // Save the data to the database.
        //add_recipes(rData,data,req,dt,res);
//});


router.get('/:recipe_id/editRecipe', (req, res, next) => {
    if (req.session.user_id == undefined) {
        req.flash('error', 'Access denied! Please Login First.', '/login');
    } else {

        getModel().recipeEdit(req.params.recipe_id, req.session.user_id, (err, entity) => {
            getModel().categoryList(null, null, (err, entities) => {
                if (err) {
                    next(err);
                    return;
                }
                res.render('pages/create-recipe', {
                    title: "Edit-recipe",
                    action: req.params.recipe_id + '/editRecipe',
                    RecipeData: entity,
                    categoryList: entities,
                    sess_val: req.session.user_id
                });
            });
        });
    }
});


router.post(
    '/:recipe_id/editRecipe',
    // images.multer.single('recipeImage'),
    // images.sendUploadToGCS,

    (req, res, next) => {
        const data = req.body;
        var dt = convertDate(new Date());
        var rData = {
            'recipe_title': data.recipetitle,
            'description': data.description,
            'category_id': data.category,
            'user_id': req.session.user_id,
            'ordinary_price':data.ordinary_price,
            'exclusive_price':data.exclusive_price,
            'buy_price':data.buy_price
        }
         console.log('image uploadinggggg');
        if (req.body && req.body.imageHiddenRc) {
            
            var s3 = new AWS.S3();
            var rand = makeid();
            var s3Bucket = new AWS.S3({
                params: {
                    Bucket: 'dishmize'
                }
            });
            var buf = new Buffer(req.body.imageHiddenRc.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            var data1 = {
                Key: rand + '.jpg',
                Body: buf
            };
            var urlParams = {
                Bucket: 'dishmize',
                Key: rand + '.jpg'
            };

            s3Bucket.putObject(data1, function (err, data1) {
                /*if (err) {
                    req.flash('error', 'Something Went Wrong. Try again.', '/register/registerUser');
                    return next();
                } else {
                    rData.recipe_image = 'https://s3.us-east-2.amazonaws.com/dishmize/' + rand + '.jpg';
                    next();
                }*/
            });
            rData.recipe_image = 'https://s3.us-east-2.amazonaws.com/dishmize/' + rand + '.jpg';
        }
        
        if(rData.recipe_image == 'undefined'){
            rData.recipe_image = req.body.exist_image;
        }
        
        
        var mData1 = [{
                    'user_id': req.session.user_id,
                    'con_key': 'basic',
                    'value': 'Cooking time',
                    'content_type': 'recipe',
                    'content_description': data.cooktime,
                    'content_type_id': req.params.recipe_id,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				},
                {
                    'user_id': req.session.user_id,
                    'con_key': 'basic',
                    'value': 'Preparation time',
                    'content_type': 'recipe',
                    'content_description': data.preptime,
                    'content_type_id': req.params.recipe_id,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				},
                {
                    'user_id': req.session.user_id,
                    'con_key': 'basic',
                    'value': 'Difficulty',
                    'content_type': 'recipe',
                    'content_description': data.difficulty,
                    'content_type_id': req.params.recipe_id,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				},
                {
                    'user_id': req.session.user_id,
                    'con_key': 'basic',
                    'value': 'Serves',
                    'content_type': 'recipe',
                    'content_description': data.numberofservings,
                    'content_type_id': req.params.recipe_id,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				},
                {
                    'user_id': req.session.user_id,
                    'con_key': 'userCat',
                    'value': 'Category',
                    'content_type': 'recipe',
                    'content_description': data.category,
                    'content_type_id': req.params.recipe_id,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				},
                {
                    'user_id': req.session.user_id,
                    'con_key': 'user',
                    'value': 'Posted by',
                    'content_type': 'recipe',
                    'content_description': req.session.firstname + ' ' + req.session.lastname,
                    'content_type_id': req.params.recipe_id,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				}];
        
        for (var i = 0; i < data.key.length; i++) {
            if (data.key[i] !== '' && data.value[i] !== '') {
                var mData = {
                    'user_id': req.session.user_id,
                    'con_key': 'ingredients',
                    'value': data.key[i],
                    'content_type': 'recipe',
                    'content_description': data.value[i],
                    'content_type_id': req.params.recipe_id,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
                };
                mData1.push(mData);
            }
        }
        
        var obj = {rData:rData,mData1:mData1};
        
        // Save the data to the database.
        getModel().deleteRecipe(req.params.recipe_id, req.session.user_id, (err) => {
            getModel().updateRecipe(req.params.recipe_id, obj, (err, savedData) => {

                if (err) {
                    req.flash('error', 'Error Occured !')
                    next(err);
                    return;
                }
                req.flash('success', 'Recipe Edited Successfully.');
            });
        });
    });


router.post(
    '/search',(req, res, next) => {
        res.redirect('/recipes/search/?recipes_search='+req.body.recipes_search);
});
router.get(
    '/search',(req, res, next) => { 
       
    getModel().searchRecipes(req.query.recipes_search, (err, recipesData,cursor) => {
       
        console.log('recipesearchresult');
        //console.log(recip);

        res.render('pages/search', {
            title: "Recipes",
            data: recipesData,
            nextPageToken: cursor,
            sess_val: req.session.user_id
        });
    });
        
});


router.get('/:recipe_id/deleteRecipe', (req, res, next) => {

    getModel().delete_RecipeAlldata(req.params.recipe_id, req.session.user_id, (err) => {
        if (err) {
            req.flash('error', 'Error in Deleting. Please try again.', '/dishmizer-profile/' + req.session.user_id);
            next(err);
            return;
        }
    });
    req.flash('success', 'Recipe Deleted Successfully.', '/dishmizer-profile/' + req.session.user_id);
});



router.post('/like/:recipe_id', (req, res, next) => {
    console.log('req.session.user_id == ',req.session.user_id);
    if (req.session.user_id == undefined) {
        res.send('session error');
    } else {
        
        var dt = convertDate(new Date());
        getModel().checkLike(req.session.user_id, req.params.recipe_id, 'recipe', (err, likeData) => {
            
            if (err && err.code === 404) {
                
                var likeData = {
                    'user_id': req.session.user_id,
                    'content_type': 'recipe',
                    'content_type_id': req.params.recipe_id,
                    'date': dt,
                    'status': 1,
                    'active': 1,
                    'is_delete': 1
                }
                var obj = {rData:likeData}
                getModel().create('dz_like', obj, (err, entity) => {
                    
                    if (err) {
                        console.log('working4');
                        res.send('session error');
                        next(err);
                        return;
                    }
                    
                    let Pusher = require('pusher');

                    var pusher = new Pusher({
                        appId: '497507',
                        key: '103150f98012224e3625',
                        secret: '549ba8b3cb9cfa48e2c1',
                        cluster: 'ap1',
                        encrypted: true
                    });

                    let payload = {
                        action: req.body.action,
                        postId: req.params.recipe_id
                    };
                    pusher.trigger('post-events', 'postAction', payload, req.body.socketId);
                    res.send('success');
                });

            } 
            else if (likeData.status !== '') {
                
                var data = (likeData.status === 1) ? {
                    'status': 0
                } : {
                    'status': 1
                };
                getModel().likestatus_update(req.session.user_id, req.params.recipe_id, 'recipe', data, (err, status) => {
                    
                    if (err) {
                        
                        res.send('session error');
                        next(err);
                        return;
                    }
                    let Pusher = require('pusher');

                    var pusher = new Pusher({
                        appId: '497507',
                        key: '103150f98012224e3625',
                        secret: '549ba8b3cb9cfa48e2c1',
                        cluster: 'ap1',
                        encrypted: true
                    });



                    let payload = {
                        action: req.body.action,
                        postId: req.params.recipe_id
                    };
                    pusher.trigger('post-events', 'postAction', payload, req.body.socketId);
                    res.send('success');
                });
            }
        });
    }
});



router.get('/category/:category', (req, res, next) => {
    
    var category = req.params.category;
    var user_id = req.session.user_id;
    
    getModel().getCategory(category, (err, dataUser) => {
        
        getModel().byCategory(dataUser.category_id, 6, req.query.pageToken, (err, byCategory, cursor) => {
            
            if (err) {
                next(err);
                return;
            }
                         
             console.log('data');
             console.log(byCategory);

            res.render('pages/bycategory', {
                title: "Recipes" + '|' + category,
                category: category,
                data: byCategory,
                nextPageToken: cursor,
                sess_val: user_id,
                like_count:dataUser.like_count,
                comment_count:dataUser.comment_count
            });
        });
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


function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function add_recipes(rData,data,req,dt,res){
    //console.log('add_recipes');
    var mData1 = [{
                    'user_id': req.session.user_id,
                    'con_key': 'basic',
                    'value': 'Cooking time',
                    'content_type': 'recipe',
                    'content_description': data.cooktime,
                    'content_type_id': 0,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				},
                  {
                    'user_id': req.session.user_id,
                    'con_key': 'basic',
                    'value': 'Preparation time',
                    'content_type': 'recipe',
                    'content_description': data.preptime,
                    'content_type_id': 0,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				},
                  {
                    'user_id': req.session.user_id,
                    'con_key': 'basic',
                    'value': 'Difficulty',
                    'content_type': 'recipe',
                    'content_description': data.difficulty,
                    'content_type_id': 0,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				},
                  {
                    'user_id': req.session.user_id,
                    'con_key': 'basic',
                    'value': 'Serves',
                    'content_type': 'recipe',
                    'content_description': data.numberofservings,
                    'content_type_id': 0,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				},
                  {
                    'user_id': req.session.user_id,
                    'con_key': 'userCat',
                    'value': 'Category',
                    'content_type': 'recipe',
                    'content_description': data.category,
                    'content_type_id': 0,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				},
                  {
                    'user_id': req.session.user_id,
                    'con_key': 'user',
                    'value': 'Posted by',
                    'content_type': 'recipe',
                    'content_description': req.session.firstname + ' ' + req.session.lastname,
                    'content_type_id': 0,
                    'date': dt,
                    'status': 1,
                    'is_delete': 1
				}];

    for (var i = 0; i < data.key.length; i++) {
        
        if (data.key[i] !== '' && data.value[i] !== '') {
            var mData = {
                'user_id': req.session.user_id,
                'con_key': 'ingredients',
                'value': data.key[i],
                'content_type': 'recipe',
                'content_description': data.value[i],
                'content_type_id': 0,
                'date': dt,
                'status': 1,
                'is_delete': 1
            }
            mData1.push(mData);
        }
    }
    //console.log('add_recipes1');
    var obj = {rData:rData,mData1:mData1};
   // console.log(obj);
    getModel().create('dz_recipes', obj, (err, savedData) => {
        if (err) {
            req.flash('error', 'Error Occured !');
            next(err);
            return;
        }
        req.flash('success', 'Recipe added Successfully.');
    });
    
    
}
