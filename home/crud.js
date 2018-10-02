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
  console.log('home');
	getModel().recipeOftheDay((err, recipeOftheDay) => {
		getModel().recipesUser(6, req.query.pagerToken, (err, dataUser, rcursor) => {
			getModel().blog(3, req.query.pagebToken, (err, dataBlog , bcursor) => {
				getModel().totalRecipe((err,totalR) => {
					getModel().totalDishmizer((err,totalD) => {
						getModel().totalPhotos((err,totalP) => {
							getModel().totalCommunity((err,totalComm) => {
								getModel().totalComment((err,totalC) => {
									getModel().totalBlog((err,totalB) => {	
									   getModel().getParchesedRecipe(req.session.user_id, (err, recipeids) =>{
                                            if (err) {
                                              console.log('errorrrrrrrrrrr');
                                              console.log(err);
                                                next(err);
                                                return;
                                            }
                                           
                                                res.render('pages/index', { 
                                                title:"Home", 
                                                recipeOftheDay:recipeOftheDay,
                                                data: dataUser ,
                                                dataBlog: dataBlog , 
                                                nextPagerToken: rcursor,
                                                nextPagebToken: bcursor,
                                                totalR:totalR[0].recipeCount,
                                                totalD:totalD[0].dishmizerCount,
                                                totalP:totalP[0].recipeImage + totalP[0].blogImage,
                                                totalComm:totalComm[0].CommCount,
                                                totalC:totalC[0].commentCount,
                                                totalB:totalB[0].blogCount,
                                                sess_val: req.session.user_id,
                                                recipeids : recipeids
                                            });       
                                       })
                                        
									});
								});
							});
						});
					}); 
				});
			});
		});
	});	
});	  

module.exports = router;


