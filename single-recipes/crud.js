'use strict';

const express = require('express');
const images = require('../lib/images');
var paypal = require('paypal-rest-sdk');
const nodemailer = require('nodemailer');
const config = require('../config');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'EBWKjlELKMYqRNQ6sYvFo64FtaRLRR5BdHEESmha49TM',
  'client_secret': 'EO422dn3gQLgDbuwqTjzrFgFtaRLRR5BdHEESmha49TM'
});


function getModel() {
    return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

var dt = convertDate(new Date());

router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});

router.get('/:recipe_id', (req, res, next) => {
    
    if (req.session.user_id == undefined) {
        req.flash('error', 'Login First.', '/login');
        return
    }
    
 getModel().checkBuyer(req.params.recipe_id,req.session.user_id, (err,checkBuyer) => {
     
    //if (err) {
        //next(err);
        //return;
    //} 
    //previous condition checkBuyer.length>0
    if (checkBuyer != undefined ){
       // console.log('check buyer');
        getModel().single_recipe(req.params.recipe_id, (err, singleData, catId) => {
        
        
            getModel().commentData(req.params.recipe_id, (err, cData, count) => {
                
                if (err) {
                    next(err);
                    return;
                }
        
                var rating = cData.rating;
                
                res.render('pages/single-recipes', {
                    title: "Single-recipes",
                    data: singleData,
                    commentData: cData.commentData,
                    countData: count,
                    catId: catId[0].name,
                    rating:rating,
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
    } else {
        req.flash('error', 'You need to Buy this recipe.','/single-recipes/buy/'+req.params.recipe_id);    
        return;
    }
 });  
});


router.post('/rating', (req, res, next) => {

    //console.log('rating');
   // console.log(req.session.user_id);
    if (req.session.user_id == undefined) {
        req.flash('error', 'Session Error ! Login First.','/login');
        return
    }

    getModel().read(req.session.user_id,req.body.recipeId, 'dz_rating', 'user_id','content_type_id', (err, entity) => {
        
        if (err) {
            //console.log('error in rating');
            //console.log(err);
            var ret = {};
            req.flash('success', 'Something went wrong. Try again.','/single-recipes/'+req.body.recipeId);
            return;
        } else if (entity !== undefined) {
            var ratData = {
                'rating': req.body.rating,
                'date': dt
            };
            getModel().update(entity.rate_id, req.session.user_id, req.body.recipeId, ratData, (err, savedData) => {
                if (err) {
                   
                    req.flash('success', 'Something went wrong. Try again.','/single-recipes/'+req.body.recipeId);
                    return;
                }
                if (savedData == 'done') {
                    req.flash('success', 'Thankyou for Updating rating.','/single-recipes/'+req.body.recipeId);
                    return;
                }
            });
        } 
        else if (entity == 404 || entity == undefined) {

            var ratData = {
                'user_id': req.session.user_id,
                'content_type': 'recipe',
                'content_type_id': req.body.recipeId,
                'rating': req.body.rating,
                'date': dt,
                'status': 1,
                'active': 1,
                'is_delete': 1
            }
            getModel().create(ratData, 'dz_rating', (err, savedData) => {
                if (err) {
                    console.log('error in rating');
                    console.log(err);
                    req.flash('success', 'Something went wrong. Try again.','/single-recipes/'+req.body.recipeId);
                    return;
                }
                if (savedData.affectedRows > 0) {
                    req.flash('success', 'Thankyou for rating.','/single-recipes/'+req.body.recipeId);
                    return;
                } else {
                    req.flash('success', 'Something went wrong. Try again.','/single-recipes/'+req.body.recipeId);
                    return;
                }
            });
        }
    });
});


router.post('/comment/:recipe_id', (req, res, next) => {
    if (req.session.user_id == undefined) {
        res.send('error');
        return
    }
    var cData = {
        'user_id': req.session.user_id,
        'content_type': 'recipe',
        'content_type_id': req.params.recipe_id,
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

router.post('/:comment_id/:recipe_id/parentCom', (req, res, next) => {
    if (req.session.user_id == undefined) {
        res.send('error');
        return
    }

    var pData = {
        'user_id': req.session.user_id,
        'content_type': 'recipe',
        'content_type_id': req.params.recipe_id,
        'comment': req.body.commentCommodel,
        'name': req.body.nameCommodel,
        'email': req.body.emailCommodel,
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

router.get('/buy/:recipe_id',(req,res) => {
   
    if (req.session.user_id == undefined) {
        req.flash('error', 'Login First.', '/login');
        return
    }
    getModel().single_recipe(req.params.recipe_id, (err, singleData, catId) => {
        getModel().commentData(req.params.recipe_id, (err, cData, count) => {
            
            if (err) {
                next(err);
                return;
            }

            var rating = cData.rating;
            
            res.render('pages/buy-recipe', {

                title: "Buy Recipes",
                data: singleData,
                commentData: cData.commentData,
                countData: count,
                catId: catId[0].name,
                rating:rating,
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

router.post('/pay/:recipe_id',(req, res) => {
    console.log('buy funnn');
    console.log(req.body);

    let price = (req.body.price !== '' || req.body.price !== null ) ? Number.parseFloat(req.body.price).toFixed(2) : '';
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": 'http://'+req.get('host')+"/single-recipes/payment/success",
            "cancel_url": 'http://'+req.get('host')+"/single-recipes/payment/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": req.body.recipe_title,
                    "sku": "item",
                    "price": price,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": price
            },
            "description": "This is the payment description."
        }]
    };
    req.session.total_price = price;
    req.session.recipe_id = req.params.recipe_id;
    req.session.buyType = req.body.buyType ;
    req.session.recipe_title = req.body.recipe_title ;
    
    paypal.payment.create(create_payment_json, function (error, payment) {

        console.log(error, payment);
        if (error) {
            console.log(error);
            throw error;
        } else {
            for(let i=0; i<payment.links.length; i++){
                if(payment.links[i].rel == 'approval_url'){
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});

router.get('/payment/success',(req,res)=>{
    
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": req.session.total_price
            }
        }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            console.log(payment);
            var obj = {
                transaction_id : payment.id,
                recipe_id : req.session.recipe_id,
                user_id : req.session.user_id,
                status : 1,
                payer_email : payment.payer.payer_info.email,
                payer_first_name:payment.payer.payer_info.first_name,
                payer_last_name :payment.payer.payer_info.last_name,
                payer_id : payment.payer.payer_info.payer_id,
                shipping_address : JSON.stringify(payment.payer.payer_info.shipping_address),
                transactions : JSON.stringify(payment.transactions),
                payee : JSON.stringify(payment.transactions[0].payee),
                description : payment.transactions[0].description,
                item_list : JSON.stringify(payment.transactions[0].item_list),
                payment_mode : payment.transactions[0].related_resources[0].sale.payment_mode,
                protection_eligibility : payment.transactions[0].related_resources[0].sale.protection_eligibility,
                protection_eligibility_type:payment.transactions[0].related_resources[0].sale.protection_eligibility_type,
                transaction_fee : JSON.stringify(payment.transactions[0].related_resources[0].sale.transaction_fee),
                parent_payment : payment.transactions[0].related_resources[0].sale.parent_payment,
                create_time : payment.transactions[0].related_resources[0].sale.create_time,
                update_time : payment.transactions[0].related_resources[0].sale.update_time
            };
            console.log('obj == ' ,obj);
            getModel().create(obj, 'dz_transaction', (err, savedTransaction) => {
                console.log('savedTransaction == ',savedTransaction);

                if (err) {
                    next(err);
                    return;
                }

                if(req.session.buyType == 'exclusiveBuy'){
                    var mailOptions = {
                        from: config.get('EMAIL_FROM'),
                        to: req.session.email,
                        subject: 'Regarding Schedule Appointment | Dishmize',
                        text: 'Hello, Thanks for buying  Recipe | '+req.session.recipe_title+'. Please check details for Appointment.'
                    };
                    sendMail_Verification(mailOptions);  
                }

                req.flash('success', 'Your transaction has been done','/single-recipes/'+req.session.recipe_id);    
            });
            
        }
    });
    
});

router.get('/payment/cancel',(req,res)=>{
    res.send('Cancelled...');
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

function sendMail_Verification(mailOptions) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.get('EMAIL_SENDING_USER'),
            pass: config.get('EMAIL_SENDING_PASS')
        }
    });
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return false;
        } else {
            return true;
        }
    });
}
