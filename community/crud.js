'use strict';

const express = require('express');
const images = require('../lib/images');
const config = require('../config');

function getModel() {
    return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();
router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});


router.get('/', (req, res, next) => {
    
    getModel().fetchCommunity((err, entities) => {
        getModel().totalCommunity((err,totalComm) => {
            getModel().totalDishmizer((err,totalD) => {
                getModel().countTopic((err,countTopic) => { 
        if (err) {
            next(err);
            return;
        }
        res.render('pages/community', {
            title: "Community",
            community: entities,
            totalComm:totalComm[0].CommCount,
            totalUser:totalD[0].dishmizerCount,
            countTopic:countTopic[0].totalTopic,
            sess_val: req.session.user_id
           });
         });
       }); 
     });
   });
});


router.get('/addPost', (req, res, next) => {
    if (req.session.user_id == undefined) {
        req.flash('error', 'please ! Login first', '/login');
        return;
    }
    getModel().fetchCommunity((err, entities) => {
        if (err) {
            next(err);
            return;
        }

        res.render('pages/add-community', {
            title: "Add-Community",
            community: entities,
            sess_val: req.session.user_id
        });
    });
});


router.post('/addPost', (req, res, next) => {

    if (req.session.user_id == undefined) {
        req.flash('error', 'please ! Login first', '/login');
        return;
    }
    /*getModel().fetchCommunity((err, entities) => {
        if (err) {
        res.send('error');
        return;
      }*/
    var dt = convertDate(new Date());
    var dataPost = {
        'user_id': req.session.user_id,
        'con_key': 'NULL',
        'value': 'NULL',
        'content_type': 'community',
        'content_description': req.body.descriptionPost,
        'content_type_id': req.body.titlePost,
        'date': dt,
        'status': 1,
        'is_delete': 1
    }

    getModel().create(dataPost, 'dz_meta', (err, savedData) => {
        if (err) {
            req.flash('error','Something is wrong. Please try again.','/community/addPost');
            return;
        }
        req.flash('success','Post added successfully.','/community/addPost');
        return;
    });
    //});
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
