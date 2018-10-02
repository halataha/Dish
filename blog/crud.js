'use strict';

const express = require('express');
const images = require('../lib/images');

const config = require('../config');


const _ = require('underscore');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const flow = require('flow');
const configPath = path.join(__dirname, '..', "config.json");
var rand22 = Math.floor((Math.random() * 9999999999) + 1);
AWS.config.loadFromPath(configPath);
//using multer to upload image
// var multer = require('multer');
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/images/blogphotos');
//     },
//     filename: function (req, file, cb) {
//         if (file.mimetype === 'image/png') {
//             cb(null, +rand22 + '.png');
//         } else {
//             cb(null, +rand22 + '.jpg');
//         }
//     }
// });
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true);
//     } else {
//         cb(new Error('File Type Is Not Supported !!'), false);
//     }
// };

// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 1024 * 1024 },
//     fileFilter: fileFilter
// });


function getModel() {
    return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});



router.get('/', (req, res, next) => {

    var page = 1;
    var limit = 5;
    var p = (page == 1 || page == 0) ? page * 0 : page * limit - limit;
    getModel().countBlog(null, (err, countBlog) => {
        getModel().blogUser(limit, p, (err, blogUser) => {
            getModel().categoryFilter((err, categoryFilter) => {

                if (err) {
                    console.log('err');
                    console.log(err);
                    next(err);
                    return;
                }




                res.render('pages/blog', {
                    title: "Blog",
                    data: blogUser,
                    current: page,
                    categoryFilter: categoryFilter,
                    pages: Math.ceil(countBlog.total / limit),
                    sess_val: req.session.user_id
                });
            });
        });
    });
});


router.get('/category/:category_id', (req, res, next) => {
    if (!isNaN(req.params.category_id)) {
        var page = 1;
        var limit = 5;
        var p = (page == 1 || page == 0) ? page * 0 : page * limit - limit;

        let cat_id = req.params.category_id;
        //console.log('categoryidddddddddddddddddddddddddddddddddd')
        //console.log(cat_id);
        //console.log('token');
        //console.log(p);



        getModel().countBlog(cat_id, (err, countBlog) => {


            getModel().blogBycategory(limit, p, cat_id, (err, blogUser) => {
                getModel().categoryFilter((err, categoryFilter) => {

                    if (err) {
                        next(err);
                        console.log('error');
                        console.log(err);
                        return;
                    }

                    // console.log('dataaaaaaaaaaa');
                    console.log(blogUser);
                    // console.log('CatID');
                    // console.log(cat_id);

                    res.render('pages/bycategory', {
                        title: "bycategory",
                        data: blogUser,
                        current: page,
                        category_id: cat_id,
                        categoryFilter: categoryFilter,
                        // pages: Math.ceil(countBlog.total / limit),
                        sess_val: req.session.user_id
                    });
                });
            });
        });
    }else{
        console.log(req.params.category_id);
        res.send('asda');
        // next();
    }
});


router.get('/category/:category_id/:page', (req, res, next) => {

    var page = req.params.page || 1;
    var limit = 5;

    var p = (page == 1 || page == 0) ? page * 0 : page * limit - limit;
    var category_id = req.params.category_id;

    getModel().countBlog(null, (err, countBlog) => {
        getModel().blogBycategory(limit, p, category_id, (err, blogUser) => {
            getModel().categoryFilter((err, categoryFilter) => {

                if (err) {
                    next(err);
                    return;
                }

                res.render('pages/bycategory', {
                    title: "Blog",
                    data: blogUser,
                    current: page,
                    category_id: category_id,
                    categoryFilter: categoryFilter,
                    pages: Math.ceil(countBlog.total / limit),
                    sess_val: req.session.user_id
                });
            });
        });
    });
});



router.get('/:page', (req, res, next) => {

    var page = req.params.page || 1;
    var limit = 5;
    var p = (page == 1 || page == 0) ? page * 0 : page * limit - limit;
    getModel().countBlog(null, (err, countBlog) => {
        getModel().blogUser(limit, p, (err, blogUser) => {
            getModel().categoryFilter((err, categoryFilter) => {

                if (err) {
                    next(err);
                    return;
                }

                res.render('pages/blog', {
                    title: "Blog",
                    data: blogUser,
                    current: page,
                    categoryFilter: categoryFilter,
                    pages: Math.ceil(countBlog.total / limit),
                    sess_val: req.session.user_id
                });
            });
        });
    });
});


router.get('/blog-edit/:blog_id', (req, res, next) => {

    if (req.session.user_id == undefined) {
        req.flash('error', 'Access denied! Please Login First.', '/login');
    } else {
        getModel().categoryList(null, null, (err, entities) => {
            getModel().getBlog(req.params.blog_id, (err, blogData) => {
                res.render('pages/blog-add', {
                    title: "Add Blog",
                    action: 'edit/blog',
                    categoryList: entities,
                    blogData: blogData,
                    sess_val: req.session.user_id
                });
            });

        });
    }
});

router.get('/blog-delete/:blog_id', (req, res, next) => {

    if (req.session.user_id == undefined) {
        req.flash('error', 'Access denied! Please Login First.', '/login');
    } else {
        getModel().deleteBlog('dz_blog', req.params.blog_id, 'blog_id', (err, blogData) => {
            req.flash('success', 'Blog deleted Successfully.', '/dishmizer-profile/' + req.session.user_id);
        });
    }
});


router.get('/add/blog', (req, res, next) => {
    if (req.session.user_id == undefined) {
        req.flash('error', 'Access denied! Please Login First.', '/login');
    } else {
        getModel().categoryList(null, null, (err, entities) => {
            res.render('pages/blog-add', {
                title: "Add Blog",
                action: 'add/blog',
                categoryList: entities,
                blogData: '',
                sess_val: req.session.user_id
            });
        });
    }
});





//my last try


// router.post('/add/blog', upload.any(), function (req, res, next) {
//     console.log('file');
//     console.log(req.files);
//     console.log('data');
//     console.log(req.body);

//     const data = req.body;
//     var dt = convertDate(new Date());
//     // var blog_id = data.blog_id; 
//     var blog_id = 0;
//     var rData = {
//         'title': data.blog_title,
//         'description': data.blog_description,
//         'categoty_id': data.blog_category,
//         'user_id': req.session.user_id,
//         'status': 1,
//         'active': 1,
//         'is_delete': 1,
//         'date': dt,
//         //'image_blog':'' + rand22 + '.jpg'

//     }
//     if (req.files.length > 0) {
//         rData.image_blog = '' + rand22 + '.jpg';
//     }
//     console.log('rdata');

//     console.log(rData);

//     getModel().create('dz_blog', rData, blog_id, (err, savedData) => {
//         if (err) {
//             console.log(err);
//             req.flash('error', 'Error Occured !');
//             next(err);
//             return;
//         }
//         else {
//             console.log('no errorr');
//             //if(blog_id != ''){
//             //req.flash('success', 'Blog updated Successfully.','/blog/blog-edit/'+blog_id);
//             //}else{
//             req.flash('success', 'Blog added Successfully.', '/blog/add/blog');
//             //}   
//         }
//     });


// })












// router.post('/add/blog',
//     images.multer.single('blogImage'),
//     images.sendUploadToGCS,
//     (req, res, next) => {

//         const data = req.body;
//         console.log('mybody');
//         console.log(req.body);
//         var dt = convertDate(new Date());
//         var blog_id = data.blog_id; 

//         var rData = {
//             'title': data.blog_title,
//             'description': data.blog_description,
//             'categoty_id': data.blog_category,
//             'user_id': req.session.user_id,
//             'status': 1,
//             'active': 1,
//             'is_delete': 1,
//             'date': dt
//         }

//         // if (req.body && req.body.imageHiddenRc) {
//         //     var s3 = new AWS.S3();
//         //     var rand = makeid();
//         //     var s3Bucket = new AWS.S3({
//         //         params: {
//         //             Bucket: 'dishmize'
//         //         }
//         //     });
//         //     var buf = new Buffer(req.body.imageHiddenRc.replace(/^data:image\/\w+;base64,/, ""), 'base64');
//         //     var data1 = {
//         //         Key: req.body.firstname + rand + '.jpg',
//         //         Body: buf
//         //     };
//         //     var urlParams = {
//         //         Bucket: 'dishmize',
//         //         Key: req.body.firstname + rand + '.jpg'
//         //     };

//         //     s3Bucket.putObject(data1, function (err, data1) {

//         //     });
//         //     rData.image_blog = 'https://s3.us-east-2.amazonaws.com/dishmize/' + req.body.firstname + rand + '.jpg';
//         // }


//         // if(data.savedBlogImage){
//         //     rData.image_blog = data.savedBlogImage;
//         // }else{
//         //     rData.image_blog = '';
//         // }
//         //console.log('data');
//        //console.log(rData);
//        //console.log('blog id');
//        //console.log(blog_id);
//         // Save the data to the database.
//         getModel().create('dz_blog', rData, blog_id, (err, savedData) => {
//             if (err) {
//                 console.log('errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
//                 console.log(err);
//                 req.flash('error', 'Error Occured !');
//                 next(err);
//                 return;
//             }

//             if(blog_id != ''){
//                 req.flash('success', 'Blog updated Successfully.','/blog/blog-edit/'+blog_id);
//             }else{
//                 req.flash('success', 'Blog added Successfully.','/blog/add/blog');
//             }   

//         });

// });


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