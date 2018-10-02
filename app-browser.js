(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
				title:"Contact", 
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
res.send('error');
return;
} else {
res.send('success');
return;
}
}); 
}



},{"../config":5,"../lib/images":9,"express":503,"nodemailer":800}],2:[function(require,module,exports){
(function (Buffer,__dirname){
'use strict';

const path = require('path');
const express = require('express');
const flash = require('express-flash-notification');
const session = require('express-session');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const passport = require('passport');
//const multer = require('multer');
const Pusher = require('pusher');
const config = require('./config');
const nodemailer = require('nodemailer');
const app = express();


app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);

var privateKey = new Buffer('abcdef00', 'hex')
console.log(privateKey.toString('hex'))


//app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use('/public', express.static('public'));
const sessionConfig = {
  resave: true,
  saveUninitialized: true,
  secret: 'DishmizeSecret',
  //signed: true,
  //cookie:{maxAge:600000}
};


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session(sessionConfig));


const flashNotificationOptions = {
  beforeSingleRender: function(item, callback) {
    if (item.type) {
      switch(item.type) {
        case 'success':
          item.alertClass = 'alert-success';
          break;
        case 'error':
          item.alertClass = 'alert-danger';
          break;
      }
    }
    callback(null, item);
  }
};

// Flash Notification Middleware Initialization
app.use(flash(app, flashNotificationOptions))

app.use('/login', require('./login/crud'));
app.use('/register', require('./register/crud'));
app.use('/home', require('./home/crud'));
app.use('/recipes', require('./recipes/crud'));
app.use('/blog', require('./blog/crud'));
app.use('/dishmizer', require('./dishmizer/crud'));
app.use('/single-recipes', require('./single-recipes/crud'));
app.use('/single-blog', require('./single-blog/crud'));
app.use('/dishmizer-profile', require('./dishmizer-profile/crud'));
app.use('/Contact-Us', require('./Contact-Us/crud'));
app.use('/community', require('./community/crud'));
app.use('/single-topic', require('./single-topic/crud'));
//app.use('/api/books', require('./books/api'));

// Redirect root to /books
app.get('/', (req, res) => {
  res.redirect('/home');
});


//app.use(logging.errorLogger);
// Basic 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});


// Basic error handler
app.use((err, req, res, next) => {
  /* jshint unused:false */
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});
// [END errors]

if (module === require.main) {
  // Start the server
    const server = app.listen(config.get('PORT'), () => {
    const port = server.address().port;
    console.log(`Dishmize New Ready To Attack! on port ${port}`);
  });
}

module.exports = app;

}).call(this,require("buffer").Buffer,"/")
},{"./Contact-Us/crud":1,"./blog/crud":3,"./community/crud":4,"./config":5,"./dishmizer-profile/crud":6,"./dishmizer/crud":7,"./home/crud":8,"./login/crud":10,"./recipes/crud":1051,"./register/crud":1052,"./single-blog/crud":1053,"./single-recipes/crud":1054,"./single-topic/crud":1055,"body-parser":360,"buffer":398,"cookie-parser":432,"express":503,"express-flash-notification":497,"express-session":498,"multer":764,"nodemailer":800,"passport":846,"path":851,"pusher":877}],3:[function(require,module,exports){
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
	var page = 1;
	var limit = 2;
	var p = (page == 1 || page == 0 ) ? page*0 : page*limit - limit;
	getModel().countBlog((err, countBlog) => {
	getModel().blogUser(limit, p, (err, blogUser) => {

			if (err) {
				next(err);
				return;
				}
                
             	res.render('pages/blog', { 
				title:"Blog", 
				data: blogUser ,
				current: page,
                pages: Math.ceil(countBlog.total / limit),
                sess_val: req.session.user_id
			});
		});
    });
});



router.get('/:page', (req, res, next) => {
	var page = req.params.page || 1;
	var limit = 2;
	var p = (page == 1 || page == 0 ) ? page*0 : page*limit - limit;
	getModel().countBlog((err, countBlog) => {
	getModel().blogUser(limit, p, (err, blogUser) => {

			if (err) {
				next(err);
				return;
				}
                
             	res.render('pages/blog', { 
				title:"Blog", 
				data: blogUser ,
				current: page,
                pages: Math.ceil(countBlog.total / limit),
                sess_val: req.session.user_id
			});
		});
    });
});



module.exports = router;



},{"../config":5,"../lib/images":9,"express":503}],4:[function(require,module,exports){
'use strict';

const express = require('express');
const images = require('../lib/images');
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
    if(req.session.user_id == undefined ){
      req.flash('error','please ! Login first','/login/loginUser');
    }
    getModel().fetchCommunity((err, entities) => {
        if (err) {
        next(err);
        return;
      }
        res.render('pages/community', { 
        title:"Community",
        community:entities,          
        sess_val: req.session.user_id
      });
    });
});


router.get('/addPost', (req, res, next) => {
    if(req.session.user_id == undefined ){
      req.flash('error','please ! Login first','/login/loginUser');
    }
    getModel().fetchCommunity((err, entities) => {
        if (err) {
        next(err);
        return;
      }

        res.render('pages/add-community', { 
        title:"Add-Community",
        community:entities,          
        sess_val: req.session.user_id
      }); 
    });
});


router.post('/addPost', (req, res, next) => {
    if(req.session.user_id == undefined ){
      req.send('error');
    }
    getModel().fetchCommunity((err, entities) => {
        if (err) {
        res.send('error');
        //next(err);
        return;
      }
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

 getModel().create(dataPost,'dz_meta',(err, savedData) => {
      if (err) {
        res.send('error');
        return;
      }
       res.send('success');
      }); 
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




},{"../config":5,"../lib/images":9,"express":503}],5:[function(require,module,exports){
(function (__dirname){
'use strict';

const nconf = module.exports = require('nconf');
const path = require('path');

nconf
  // 1. Command-line arguments
  .argv()
  // 2. Environment variables
  .env([
    'DATA_BACKEND',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'POST',
    'NODE_ENV',
    'PORT',
    'SECRET'
  ])
  // 3. Config file
  .file({ file: path.join(__dirname, 'config.json') })
  // 4. Defaults
  .defaults({
    DATA_BACKEND: 'cloudsql',
    MYSQL_USER: '',
    MYSQL_PASSWORD: '',
    PORT: 3000,
    SECRET: 'keyboardcat'
  });


if (nconf.get('DATA_BACKEND') === 'cloudsql') {
  checkConfig('MYSQL_USER');
  checkConfig('MYSQL_PASSWORD');
  
}

function checkConfig (setting) {
  if (!nconf.get(setting)) {
    throw new Error(`You must set ${setting} as an environment variable or in config.json!`);
  }
}

}).call(this,"/")
},{"nconf":772,"path":851}],6:[function(require,module,exports){
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
   var dt = convertDate(new Date()); 	
	

  	
  	var mDdata = {
	'value': req.body.profile_comment,
	'content_description': req.body.description_con
	};

  	var uData = {
          'firstname': data.fName,
          'lastname': data.LName,
          'username': data.usrnm
        }

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
   
   if (req.file && req.file.cloudStoragePublicUrl) {
      uData.imageUrl = req.file.cloudStoragePublicUrl;
   }

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

		getModel().recipeData(req.params.user_id , (err, recipeData) => {
			getModel().postData(req.params.user_id , (err, postData) => {
         	if (err) {
				next(err);
				return;
				}
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
    req.flash('error','Access denied! Please Login First.','/login/loginUser') ;
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
	//next(err);
	return;
	}
	});
}
res.redirect(req.baseUrl+'/'+req.session.user_id);
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

},{"../config":5,"../lib/images":9,"express":503}],7:[function(require,module,exports){
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
var page = req.params.page || 1;
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



},{"../config":5,"../lib/images":9,"express":503}],8:[function(require,module,exports){
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
	getModel().recipeOftheDay((err, recipeOftheDay) => {
		getModel().recipesUser(6, req.query.pagerToken, (err, dataUser, rcursor) => {
			getModel().blog(3, req.query.pagebToken, (err, dataBlog , bcursor) => {
				getModel().totalRecipe((err,totalR) => {
					getModel().totalDishmizer((err,totalD) => {
						getModel().totalPhotos((err,totalP) => {
							getModel().totalCommunity((err,totalComm) => {
								getModel().totalComment((err,totalC) => {
									getModel().totalBlog((err,totalB) => {	
									
											if (err) {
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
											sess_val: req.session.user_id
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
});	  

module.exports = router;



},{"../config":5,"../lib/images":9,"express":503}],9:[function(require,module,exports){
(function (__dirname){
/*'use strict';

const Storage = require('@google-cloud/storage');
const config = require('../config');

const CLOUD_BUCKET = config.get('CLOUD_BUCKET');

const storage = Storage({
  projectId: config.get('GCLOUD_PROJECT')
});
const bucket = storage.bucket(CLOUD_BUCKET);

function getPublicUrl (filename) {
  return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`;
}

function sendUploadToGCS (req, res, next) {
  if (!req.file) {
    return next();
  }

  console.log(req.file);

  const gcsname = Date.now() + req.file.originalname;
  const file = bucket.file(gcsname);
  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    file.makePublic().then(() => {
      req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
      next();
    });
  });

  stream.end(req.file.buffer);
}

const Multer = require('multer');
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb
  }
});

module.exports = {
  getPublicUrl,
  sendUploadToGCS,
  multer
};*/


'use strict';

const _ = require('underscore');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const flow = require('flow');
const configPath = path.join(__dirname, '..', "config.json");
AWS.config.loadFromPath(configPath);

function getPublicUrl (filename) {
  return 'https://s3.us-east-2.amazonaws.com/dishmize/'+filename;
}

function sendUploadToGCS (req, res, next) {
  if (!req.file) {
    return next();
  }


  var s3 = new AWS.S3();
  var s3Bucket = new AWS.S3( { params: {Bucket: 'dishmize'} } );
  var data = {Key: req.file.originalname , Body: req.file.buffer};
  var urlParams = { Bucket: 'dishmize', Key: req.file.originalname };

  s3Bucket.putObject(data, function(err, data){
  if (err) 
  { req.file.cloudStorageError = err;
    next(err); 
  } else {
    req.file.cloudStoragePublicUrl = getPublicUrl(req.file.originalname);
      next();
  }
  }); 
}

//const Multer = require('multer');
// const multer = Multer({
//   storage: Multer.MemoryStorage,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // no larger than 5mb
//   }
// });

module.exports = {
  getPublicUrl,
  sendUploadToGCS,
  multer
};




}).call(this,"/lib")
},{"aws-sdk":271,"flow":522,"fs":397,"multer":764,"path":851,"underscore":1016}],10:[function(require,module,exports){
(function (Buffer){
'use strict';

const express = require('express');
const images = require('../lib/images');
const nodemailer = require('nodemailer');
const config = require('../config');

function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
              user: config.get('EMAIL_SENDING_USER'),
              pass: config.get('EMAIL_SENDING_PASS')
              }
              });

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});


router.get('/loginUser', (req, res, next) => {
  var cookie_val = req.cookies.cookieName;
    res.render('pages/login', { title:"Login" , sess_val: req.session.user_id, cookie_val : cookie_val });
});



router.post('/changePassword', (req, res, next) => {
  console.log(req);

  var queryString = Buffer.from(req.body.email).toString('base64');
  var randomNum = Math.floor(100000 + Math.random() * 900000);

  getModel().checkEmail_Exists(req.body.email, (err, savedData) => {
    
    if (err) {
        next(err);
        return;
    }else if (savedData.length > 0 ){

      var data = {'status': randomNum }; 
      getModel().update_num(req.body.email,data, (err, savedData) => {
      if (err) {
        next(err);
        return;
      }
      
        var mailOptions = {
                      from: config.get('EMAIL_FROM'),
                      to: req.body.email,
                      subject: 'Forgot Password | Dishmize',
                      text: 'Hello, Please go to this link for reset your password '+req.headers.origin+'/login/Password_setting/?con='+queryString+'&token='+randomNum
                    };

                      transporter.sendMail(mailOptions, function(error, info){
                      if (error) {
                      res.send('Error Occured On Email Sending. Please try again');
                      return;
                      }else{
                      res.send('The reset Password link sent on your email address, please check your Email.');
                      return;
                      }
                      });
             
        });
       }else{
        res.send('Email Id does not exists.');
       }
    });
});



router.get('/Password_setting', (req, res, next) => {
var email = Buffer.from(req.query.con,'base64').toString('ascii');
var token = req.query.token;
var data = {'email': email, 'token': token };  
res.render('pages/forgotPassword', { title:"Change Password",sess_val: req.session.user_id , data:data });
});


router.post('/Password_setting', (req, res, next) => {

var data = {'password': req.body.password , 'confirmpassword': req.body.confirm_password };
  
   getModel().update_password(req.body.emailP,req.body.token ,data, (err, savedData) => {
      if (err || savedData == undefined) {
      res.send('Link Expired. Please generate again.');
      }else if(savedData == 'Done'){
       res.send('Password Changed successfully.'); 
      }

    });
});


router.post('/loginUser', (req, res, next) => {
  
  var username = req.body.username;
  var password = req.body.password;
  var remember_me = req.body.remember_me;

 if(remember_me == true){
   
    res.cookie('cookieName',username, { maxAge: 900000, httpOnly: true });
     
 }
  
 getModel().loginUser(username,password, (err, entities) => {
 if (err == 'err') {
    var ent = {};
    ent['msg'] = entities;
    ent['loginstatus'] = 'error';
    res.send(JSON.stringify(ent));
    return;
}else{
    req.session.user_id = entities[0].user_id;
    req.session.email = entities[0].email;
    req.session.firstname = entities[0].firstname;
    req.session.lastname = entities[0].lastname;
    req.session.imageUrl = entities[0].imageUrl;
    entities[0].loginstatus = 'success'; 
    res.send(JSON.stringify(entities[0]));
    //res.redirect('/dishmizer-profile/'+entities[0].user_id+'');
    }
  });
});



router.post('/resendLink', (req, res, next) => {
  
    var email = req.body.email;
   
        getModel().checkUser_Email(email,(err, entities) => {
        
        if (err) {
            res.send('error');
            return;
        }else if(entities.active == 1){
            res.send('You already verified your Email. You can login.');  
        }else{
            
            var queryString = Buffer.from(email).toString('base64');
            var mailOptions = {
            from: config.get('EMAIL_FROM'),
            to: email,
            subject: 'Email Verification | Dishmize',
            text: 'Hello, Thanks for signing up on Dishmize '+req.headers.origin+'/register/statusChange_email/?con='+queryString
            };

              transporter.sendMail(mailOptions, function(error, info){
              if (error) {
              res.send('Error Occured On Email Sending. Please try again');
              return;
              }else{
              res.send('Verification Link send on given email. please check it.');
              return;
              }
              });
        }
    });
});




router.get('/logout', (req, res) => {
  //req.session = null;
  req.session.destroy();
  res.redirect('/login/loginUser');
});


module.exports = router;




}).call(this,require("buffer").Buffer)
},{"../config":5,"../lib/images":9,"buffer":398,"express":503,"nodemailer":800}],11:[function(require,module,exports){
/*!
 * accepts
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

var Negotiator = require('negotiator')
var mime = require('mime-types')

/**
 * Module exports.
 * @public
 */

module.exports = Accepts

/**
 * Create a new Accepts object for the given req.
 *
 * @param {object} req
 * @public
 */

function Accepts (req) {
  if (!(this instanceof Accepts)) {
    return new Accepts(req)
  }

  this.headers = req.headers
  this.negotiator = new Negotiator(req)
}

/**
 * Check if the given `type(s)` is acceptable, returning
 * the best match when true, otherwise `undefined`, in which
 * case you should respond with 406 "Not Acceptable".
 *
 * The `type` value may be a single mime type string
 * such as "application/json", the extension name
 * such as "json" or an array `["json", "html", "text/plain"]`. When a list
 * or array is given the _best_ match, if any is returned.
 *
 * Examples:
 *
 *     // Accept: text/html
 *     this.types('html');
 *     // => "html"
 *
 *     // Accept: text/*, application/json
 *     this.types('html');
 *     // => "html"
 *     this.types('text/html');
 *     // => "text/html"
 *     this.types('json', 'text');
 *     // => "json"
 *     this.types('application/json');
 *     // => "application/json"
 *
 *     // Accept: text/*, application/json
 *     this.types('image/png');
 *     this.types('png');
 *     // => undefined
 *
 *     // Accept: text/*;q=.5, application/json
 *     this.types(['html', 'json']);
 *     this.types('html', 'json');
 *     // => "json"
 *
 * @param {String|Array} types...
 * @return {String|Array|Boolean}
 * @public
 */

Accepts.prototype.type =
Accepts.prototype.types = function (types_) {
  var types = types_

  // support flattened arguments
  if (types && !Array.isArray(types)) {
    types = new Array(arguments.length)
    for (var i = 0; i < types.length; i++) {
      types[i] = arguments[i]
    }
  }

  // no types, return all requested types
  if (!types || types.length === 0) {
    return this.negotiator.mediaTypes()
  }

  // no accept header, return first given type
  if (!this.headers.accept) {
    return types[0]
  }

  var mimes = types.map(extToMime)
  var accepts = this.negotiator.mediaTypes(mimes.filter(validMime))
  var first = accepts[0]

  return first
    ? types[mimes.indexOf(first)]
    : false
}

/**
 * Return accepted encodings or best fit based on `encodings`.
 *
 * Given `Accept-Encoding: gzip, deflate`
 * an array sorted by quality is returned:
 *
 *     ['gzip', 'deflate']
 *
 * @param {String|Array} encodings...
 * @return {String|Array}
 * @public
 */

Accepts.prototype.encoding =
Accepts.prototype.encodings = function (encodings_) {
  var encodings = encodings_

  // support flattened arguments
  if (encodings && !Array.isArray(encodings)) {
    encodings = new Array(arguments.length)
    for (var i = 0; i < encodings.length; i++) {
      encodings[i] = arguments[i]
    }
  }

  // no encodings, return all requested encodings
  if (!encodings || encodings.length === 0) {
    return this.negotiator.encodings()
  }

  return this.negotiator.encodings(encodings)[0] || false
}

/**
 * Return accepted charsets or best fit based on `charsets`.
 *
 * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
 * an array sorted by quality is returned:
 *
 *     ['utf-8', 'utf-7', 'iso-8859-1']
 *
 * @param {String|Array} charsets...
 * @return {String|Array}
 * @public
 */

Accepts.prototype.charset =
Accepts.prototype.charsets = function (charsets_) {
  var charsets = charsets_

  // support flattened arguments
  if (charsets && !Array.isArray(charsets)) {
    charsets = new Array(arguments.length)
    for (var i = 0; i < charsets.length; i++) {
      charsets[i] = arguments[i]
    }
  }

  // no charsets, return all requested charsets
  if (!charsets || charsets.length === 0) {
    return this.negotiator.charsets()
  }

  return this.negotiator.charsets(charsets)[0] || false
}

/**
 * Return accepted languages or best fit based on `langs`.
 *
 * Given `Accept-Language: en;q=0.8, es, pt`
 * an array sorted by quality is returned:
 *
 *     ['es', 'pt', 'en']
 *
 * @param {String|Array} langs...
 * @return {Array|String}
 * @public
 */

Accepts.prototype.lang =
Accepts.prototype.langs =
Accepts.prototype.language =
Accepts.prototype.languages = function (languages_) {
  var languages = languages_

  // support flattened arguments
  if (languages && !Array.isArray(languages)) {
    languages = new Array(arguments.length)
    for (var i = 0; i < languages.length; i++) {
      languages[i] = arguments[i]
    }
  }

  // no languages, return all requested languages
  if (!languages || languages.length === 0) {
    return this.negotiator.languages()
  }

  return this.negotiator.languages(languages)[0] || false
}

/**
 * Convert extnames to mime.
 *
 * @param {String} type
 * @return {String}
 * @private
 */

function extToMime (type) {
  return type.indexOf('/') === -1
    ? mime.lookup(type)
    : type
}

/**
 * Check if mime is valid.
 *
 * @param {String} type
 * @return {String}
 * @private
 */

function validMime (type) {
  return typeof type === 'string'
}

},{"mime-types":757,"negotiator":779}],12:[function(require,module,exports){
var parsePath = require('./lib/parse-path')
var setValue = require('./lib/set-value')

function appendField (store, key, value) {
  var steps = parsePath(key)

  steps.reduce(function (context, step) {
    return setValue(context, step, context[step.key], value)
  }, store)
}

module.exports = appendField

},{"./lib/parse-path":13,"./lib/set-value":14}],13:[function(require,module,exports){
var reFirstKey = /^[^\[]*/
var reDigitPath = /^\[(\d+)\]/
var reNormalPath = /^\[([^\]]+)\]/

function parsePath (key) {
  function failure () {
    return [{ type: 'object', key: key, last: true }]
  }

  var firstKey = reFirstKey.exec(key)[0]
  if (!firstKey) return failure()

  var len = key.length
  var pos = firstKey.length
  var tail = { type: 'object', key: firstKey }
  var steps = [tail]

  while (pos < len) {
    var m

    if (key[pos] === '[' && key[pos + 1] === ']') {
      pos += 2
      tail.append = true
      if (pos !== len) return failure()
      continue
    }

    m = reDigitPath.exec(key.substring(pos))
    if (m !== null) {
      pos += m[0].length
      tail.nextType = 'array'
      tail = { type: 'array', key: parseInt(m[1], 10) }
      steps.push(tail)
      continue
    }

    m = reNormalPath.exec(key.substring(pos))
    if (m !== null) {
      pos += m[0].length
      tail.nextType = 'object'
      tail = { type: 'object', key: m[1] }
      steps.push(tail)
      continue
    }

    return failure()
  }

  tail.last = true
  return steps
}

module.exports = parsePath

},{}],14:[function(require,module,exports){
function valueType (value) {
  if (value === undefined) return 'undefined'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  return 'scalar'
}

function setLastValue (context, step, currentValue, entryValue) {
  switch (valueType(currentValue)) {
    case 'undefined':
      if (step.append) {
        context[step.key] = [entryValue]
      } else {
        context[step.key] = entryValue
      }
      break
    case 'array':
      context[step.key].push(entryValue)
      break
    case 'object':
      return setLastValue(currentValue, { type: 'object', key: '', last: true }, currentValue[''], entryValue)
    case 'scalar':
      context[step.key] = [context[step.key], entryValue]
      break
  }

  return context
}

function setValue (context, step, currentValue, entryValue) {
  if (step.last) return setLastValue(context, step, currentValue, entryValue)

  var obj
  switch (valueType(currentValue)) {
    case 'undefined':
      if (step.nextType === 'array') {
        context[step.key] = []
      } else {
        context[step.key] = Object.create(null)
      }
      return context[step.key]
    case 'object':
      return context[step.key]
    case 'array':
      if (step.nextType === 'array') {
        return currentValue
      }

      obj = Object.create(null)
      context[step.key] = obj
      currentValue.forEach(function (item, i) {
        if (item !== undefined) obj['' + i] = item
      })

      return obj
    case 'scalar':
      obj = Object.create(null)
      obj[''] = currentValue
      context[step.key] = obj
      return obj
  }
}

module.exports = setValue

},{}],15:[function(require,module,exports){
'use strict'

/**
 * Expose `arrayFlatten`.
 */
module.exports = arrayFlatten

/**
 * Recursive flatten function with depth.
 *
 * @param  {Array}  array
 * @param  {Array}  result
 * @param  {Number} depth
 * @return {Array}
 */
function flattenWithDepth (array, result, depth) {
  for (var i = 0; i < array.length; i++) {
    var value = array[i]

    if (depth > 0 && Array.isArray(value)) {
      flattenWithDepth(value, result, depth - 1)
    } else {
      result.push(value)
    }
  }

  return result
}

/**
 * Recursive flatten function. Omitting depth is slightly faster.
 *
 * @param  {Array} array
 * @param  {Array} result
 * @return {Array}
 */
function flattenForever (array, result) {
  for (var i = 0; i < array.length; i++) {
    var value = array[i]

    if (Array.isArray(value)) {
      flattenForever(value, result)
    } else {
      result.push(value)
    }
  }

  return result
}

/**
 * Flatten an array, with the ability to define a depth.
 *
 * @param  {Array}  array
 * @param  {Number} depth
 * @return {Array}
 */
function arrayFlatten (array, depth) {
  if (depth == null) {
    return flattenForever(array, [])
  }

  return flattenWithDepth(array, [], depth)
}

},{}],16:[function(require,module,exports){
var asn1 = exports;

asn1.bignum = require('bn.js');

asn1.define = require('./asn1/api').define;
asn1.base = require('./asn1/base');
asn1.constants = require('./asn1/constants');
asn1.decoders = require('./asn1/decoders');
asn1.encoders = require('./asn1/encoders');

},{"./asn1/api":17,"./asn1/base":19,"./asn1/constants":23,"./asn1/decoders":25,"./asn1/encoders":28,"bn.js":359}],17:[function(require,module,exports){
var asn1 = require('../asn1');
var inherits = require('inherits');

var api = exports;

api.define = function define(name, body) {
  return new Entity(name, body);
};

function Entity(name, body) {
  this.name = name;
  this.body = body;

  this.decoders = {};
  this.encoders = {};
};

Entity.prototype._createNamed = function createNamed(base) {
  var named;
  try {
    named = require('vm').runInThisContext(
      '(function ' + this.name + '(entity) {\n' +
      '  this._initNamed(entity);\n' +
      '})'
    );
  } catch (e) {
    named = function (entity) {
      this._initNamed(entity);
    };
  }
  inherits(named, base);
  named.prototype._initNamed = function initnamed(entity) {
    base.call(this, entity);
  };

  return new named(this);
};

Entity.prototype._getDecoder = function _getDecoder(enc) {
  enc = enc || 'der';
  // Lazily create decoder
  if (!this.decoders.hasOwnProperty(enc))
    this.decoders[enc] = this._createNamed(asn1.decoders[enc]);
  return this.decoders[enc];
};

Entity.prototype.decode = function decode(data, enc, options) {
  return this._getDecoder(enc).decode(data, options);
};

Entity.prototype._getEncoder = function _getEncoder(enc) {
  enc = enc || 'der';
  // Lazily create encoder
  if (!this.encoders.hasOwnProperty(enc))
    this.encoders[enc] = this._createNamed(asn1.encoders[enc]);
  return this.encoders[enc];
};

Entity.prototype.encode = function encode(data, enc, /* internal */ reporter) {
  return this._getEncoder(enc).encode(data, reporter);
};

},{"../asn1":16,"inherits":592,"vm":1032}],18:[function(require,module,exports){
var inherits = require('inherits');
var Reporter = require('../base').Reporter;
var Buffer = require('buffer').Buffer;

function DecoderBuffer(base, options) {
  Reporter.call(this, options);
  if (!Buffer.isBuffer(base)) {
    this.error('Input not Buffer');
    return;
  }

  this.base = base;
  this.offset = 0;
  this.length = base.length;
}
inherits(DecoderBuffer, Reporter);
exports.DecoderBuffer = DecoderBuffer;

DecoderBuffer.prototype.save = function save() {
  return { offset: this.offset, reporter: Reporter.prototype.save.call(this) };
};

DecoderBuffer.prototype.restore = function restore(save) {
  // Return skipped data
  var res = new DecoderBuffer(this.base);
  res.offset = save.offset;
  res.length = this.offset;

  this.offset = save.offset;
  Reporter.prototype.restore.call(this, save.reporter);

  return res;
};

DecoderBuffer.prototype.isEmpty = function isEmpty() {
  return this.offset === this.length;
};

DecoderBuffer.prototype.readUInt8 = function readUInt8(fail) {
  if (this.offset + 1 <= this.length)
    return this.base.readUInt8(this.offset++, true);
  else
    return this.error(fail || 'DecoderBuffer overrun');
}

DecoderBuffer.prototype.skip = function skip(bytes, fail) {
  if (!(this.offset + bytes <= this.length))
    return this.error(fail || 'DecoderBuffer overrun');

  var res = new DecoderBuffer(this.base);

  // Share reporter state
  res._reporterState = this._reporterState;

  res.offset = this.offset;
  res.length = this.offset + bytes;
  this.offset += bytes;
  return res;
}

DecoderBuffer.prototype.raw = function raw(save) {
  return this.base.slice(save ? save.offset : this.offset, this.length);
}

function EncoderBuffer(value, reporter) {
  if (Array.isArray(value)) {
    this.length = 0;
    this.value = value.map(function(item) {
      if (!(item instanceof EncoderBuffer))
        item = new EncoderBuffer(item, reporter);
      this.length += item.length;
      return item;
    }, this);
  } else if (typeof value === 'number') {
    if (!(0 <= value && value <= 0xff))
      return reporter.error('non-byte EncoderBuffer value');
    this.value = value;
    this.length = 1;
  } else if (typeof value === 'string') {
    this.value = value;
    this.length = Buffer.byteLength(value);
  } else if (Buffer.isBuffer(value)) {
    this.value = value;
    this.length = value.length;
  } else {
    return reporter.error('Unsupported type: ' + typeof value);
  }
}
exports.EncoderBuffer = EncoderBuffer;

EncoderBuffer.prototype.join = function join(out, offset) {
  if (!out)
    out = new Buffer(this.length);
  if (!offset)
    offset = 0;

  if (this.length === 0)
    return out;

  if (Array.isArray(this.value)) {
    this.value.forEach(function(item) {
      item.join(out, offset);
      offset += item.length;
    });
  } else {
    if (typeof this.value === 'number')
      out[offset] = this.value;
    else if (typeof this.value === 'string')
      out.write(this.value, offset);
    else if (Buffer.isBuffer(this.value))
      this.value.copy(out, offset);
    offset += this.length;
  }

  return out;
};

},{"../base":19,"buffer":398,"inherits":592}],19:[function(require,module,exports){
var base = exports;

base.Reporter = require('./reporter').Reporter;
base.DecoderBuffer = require('./buffer').DecoderBuffer;
base.EncoderBuffer = require('./buffer').EncoderBuffer;
base.Node = require('./node');

},{"./buffer":18,"./node":20,"./reporter":21}],20:[function(require,module,exports){
var Reporter = require('../base').Reporter;
var EncoderBuffer = require('../base').EncoderBuffer;
var DecoderBuffer = require('../base').DecoderBuffer;
var assert = require('minimalistic-assert');

// Supported tags
var tags = [
  'seq', 'seqof', 'set', 'setof', 'objid', 'bool',
  'gentime', 'utctime', 'null_', 'enum', 'int', 'objDesc',
  'bitstr', 'bmpstr', 'charstr', 'genstr', 'graphstr', 'ia5str', 'iso646str',
  'numstr', 'octstr', 'printstr', 't61str', 'unistr', 'utf8str', 'videostr'
];

// Public methods list
var methods = [
  'key', 'obj', 'use', 'optional', 'explicit', 'implicit', 'def', 'choice',
  'any', 'contains'
].concat(tags);

// Overrided methods list
var overrided = [
  '_peekTag', '_decodeTag', '_use',
  '_decodeStr', '_decodeObjid', '_decodeTime',
  '_decodeNull', '_decodeInt', '_decodeBool', '_decodeList',

  '_encodeComposite', '_encodeStr', '_encodeObjid', '_encodeTime',
  '_encodeNull', '_encodeInt', '_encodeBool'
];

function Node(enc, parent) {
  var state = {};
  this._baseState = state;

  state.enc = enc;

  state.parent = parent || null;
  state.children = null;

  // State
  state.tag = null;
  state.args = null;
  state.reverseArgs = null;
  state.choice = null;
  state.optional = false;
  state.any = false;
  state.obj = false;
  state.use = null;
  state.useDecoder = null;
  state.key = null;
  state['default'] = null;
  state.explicit = null;
  state.implicit = null;
  state.contains = null;

  // Should create new instance on each method
  if (!state.parent) {
    state.children = [];
    this._wrap();
  }
}
module.exports = Node;

var stateProps = [
  'enc', 'parent', 'children', 'tag', 'args', 'reverseArgs', 'choice',
  'optional', 'any', 'obj', 'use', 'alteredUse', 'key', 'default', 'explicit',
  'implicit', 'contains'
];

Node.prototype.clone = function clone() {
  var state = this._baseState;
  var cstate = {};
  stateProps.forEach(function(prop) {
    cstate[prop] = state[prop];
  });
  var res = new this.constructor(cstate.parent);
  res._baseState = cstate;
  return res;
};

Node.prototype._wrap = function wrap() {
  var state = this._baseState;
  methods.forEach(function(method) {
    this[method] = function _wrappedMethod() {
      var clone = new this.constructor(this);
      state.children.push(clone);
      return clone[method].apply(clone, arguments);
    };
  }, this);
};

Node.prototype._init = function init(body) {
  var state = this._baseState;

  assert(state.parent === null);
  body.call(this);

  // Filter children
  state.children = state.children.filter(function(child) {
    return child._baseState.parent === this;
  }, this);
  assert.equal(state.children.length, 1, 'Root node can have only one child');
};

Node.prototype._useArgs = function useArgs(args) {
  var state = this._baseState;

  // Filter children and args
  var children = args.filter(function(arg) {
    return arg instanceof this.constructor;
  }, this);
  args = args.filter(function(arg) {
    return !(arg instanceof this.constructor);
  }, this);

  if (children.length !== 0) {
    assert(state.children === null);
    state.children = children;

    // Replace parent to maintain backward link
    children.forEach(function(child) {
      child._baseState.parent = this;
    }, this);
  }
  if (args.length !== 0) {
    assert(state.args === null);
    state.args = args;
    state.reverseArgs = args.map(function(arg) {
      if (typeof arg !== 'object' || arg.constructor !== Object)
        return arg;

      var res = {};
      Object.keys(arg).forEach(function(key) {
        if (key == (key | 0))
          key |= 0;
        var value = arg[key];
        res[value] = key;
      });
      return res;
    });
  }
};

//
// Overrided methods
//

overrided.forEach(function(method) {
  Node.prototype[method] = function _overrided() {
    var state = this._baseState;
    throw new Error(method + ' not implemented for encoding: ' + state.enc);
  };
});

//
// Public methods
//

tags.forEach(function(tag) {
  Node.prototype[tag] = function _tagMethod() {
    var state = this._baseState;
    var args = Array.prototype.slice.call(arguments);

    assert(state.tag === null);
    state.tag = tag;

    this._useArgs(args);

    return this;
  };
});

Node.prototype.use = function use(item) {
  assert(item);
  var state = this._baseState;

  assert(state.use === null);
  state.use = item;

  return this;
};

Node.prototype.optional = function optional() {
  var state = this._baseState;

  state.optional = true;

  return this;
};

Node.prototype.def = function def(val) {
  var state = this._baseState;

  assert(state['default'] === null);
  state['default'] = val;
  state.optional = true;

  return this;
};

Node.prototype.explicit = function explicit(num) {
  var state = this._baseState;

  assert(state.explicit === null && state.implicit === null);
  state.explicit = num;

  return this;
};

Node.prototype.implicit = function implicit(num) {
  var state = this._baseState;

  assert(state.explicit === null && state.implicit === null);
  state.implicit = num;

  return this;
};

Node.prototype.obj = function obj() {
  var state = this._baseState;
  var args = Array.prototype.slice.call(arguments);

  state.obj = true;

  if (args.length !== 0)
    this._useArgs(args);

  return this;
};

Node.prototype.key = function key(newKey) {
  var state = this._baseState;

  assert(state.key === null);
  state.key = newKey;

  return this;
};

Node.prototype.any = function any() {
  var state = this._baseState;

  state.any = true;

  return this;
};

Node.prototype.choice = function choice(obj) {
  var state = this._baseState;

  assert(state.choice === null);
  state.choice = obj;
  this._useArgs(Object.keys(obj).map(function(key) {
    return obj[key];
  }));

  return this;
};

Node.prototype.contains = function contains(item) {
  var state = this._baseState;

  assert(state.use === null);
  state.contains = item;

  return this;
};

//
// Decoding
//

Node.prototype._decode = function decode(input, options) {
  var state = this._baseState;

  // Decode root node
  if (state.parent === null)
    return input.wrapResult(state.children[0]._decode(input, options));

  var result = state['default'];
  var present = true;

  var prevKey = null;
  if (state.key !== null)
    prevKey = input.enterKey(state.key);

  // Check if tag is there
  if (state.optional) {
    var tag = null;
    if (state.explicit !== null)
      tag = state.explicit;
    else if (state.implicit !== null)
      tag = state.implicit;
    else if (state.tag !== null)
      tag = state.tag;

    if (tag === null && !state.any) {
      // Trial and Error
      var save = input.save();
      try {
        if (state.choice === null)
          this._decodeGeneric(state.tag, input, options);
        else
          this._decodeChoice(input, options);
        present = true;
      } catch (e) {
        present = false;
      }
      input.restore(save);
    } else {
      present = this._peekTag(input, tag, state.any);

      if (input.isError(present))
        return present;
    }
  }

  // Push object on stack
  var prevObj;
  if (state.obj && present)
    prevObj = input.enterObject();

  if (present) {
    // Unwrap explicit values
    if (state.explicit !== null) {
      var explicit = this._decodeTag(input, state.explicit);
      if (input.isError(explicit))
        return explicit;
      input = explicit;
    }

    var start = input.offset;

    // Unwrap implicit and normal values
    if (state.use === null && state.choice === null) {
      if (state.any)
        var save = input.save();
      var body = this._decodeTag(
        input,
        state.implicit !== null ? state.implicit : state.tag,
        state.any
      );
      if (input.isError(body))
        return body;

      if (state.any)
        result = input.raw(save);
      else
        input = body;
    }

    if (options && options.track && state.tag !== null)
      options.track(input.path(), start, input.length, 'tagged');

    if (options && options.track && state.tag !== null)
      options.track(input.path(), input.offset, input.length, 'content');

    // Select proper method for tag
    if (state.any)
      result = result;
    else if (state.choice === null)
      result = this._decodeGeneric(state.tag, input, options);
    else
      result = this._decodeChoice(input, options);

    if (input.isError(result))
      return result;

    // Decode children
    if (!state.any && state.choice === null && state.children !== null) {
      state.children.forEach(function decodeChildren(child) {
        // NOTE: We are ignoring errors here, to let parser continue with other
        // parts of encoded data
        child._decode(input, options);
      });
    }

    // Decode contained/encoded by schema, only in bit or octet strings
    if (state.contains && (state.tag === 'octstr' || state.tag === 'bitstr')) {
      var data = new DecoderBuffer(result);
      result = this._getUse(state.contains, input._reporterState.obj)
          ._decode(data, options);
    }
  }

  // Pop object
  if (state.obj && present)
    result = input.leaveObject(prevObj);

  // Set key
  if (state.key !== null && (result !== null || present === true))
    input.leaveKey(prevKey, state.key, result);
  else if (prevKey !== null)
    input.exitKey(prevKey);

  return result;
};

Node.prototype._decodeGeneric = function decodeGeneric(tag, input, options) {
  var state = this._baseState;

  if (tag === 'seq' || tag === 'set')
    return null;
  if (tag === 'seqof' || tag === 'setof')
    return this._decodeList(input, tag, state.args[0], options);
  else if (/str$/.test(tag))
    return this._decodeStr(input, tag, options);
  else if (tag === 'objid' && state.args)
    return this._decodeObjid(input, state.args[0], state.args[1], options);
  else if (tag === 'objid')
    return this._decodeObjid(input, null, null, options);
  else if (tag === 'gentime' || tag === 'utctime')
    return this._decodeTime(input, tag, options);
  else if (tag === 'null_')
    return this._decodeNull(input, options);
  else if (tag === 'bool')
    return this._decodeBool(input, options);
  else if (tag === 'objDesc')
    return this._decodeStr(input, tag, options);
  else if (tag === 'int' || tag === 'enum')
    return this._decodeInt(input, state.args && state.args[0], options);

  if (state.use !== null) {
    return this._getUse(state.use, input._reporterState.obj)
        ._decode(input, options);
  } else {
    return input.error('unknown tag: ' + tag);
  }
};

Node.prototype._getUse = function _getUse(entity, obj) {

  var state = this._baseState;
  // Create altered use decoder if implicit is set
  state.useDecoder = this._use(entity, obj);
  assert(state.useDecoder._baseState.parent === null);
  state.useDecoder = state.useDecoder._baseState.children[0];
  if (state.implicit !== state.useDecoder._baseState.implicit) {
    state.useDecoder = state.useDecoder.clone();
    state.useDecoder._baseState.implicit = state.implicit;
  }
  return state.useDecoder;
};

Node.prototype._decodeChoice = function decodeChoice(input, options) {
  var state = this._baseState;
  var result = null;
  var match = false;

  Object.keys(state.choice).some(function(key) {
    var save = input.save();
    var node = state.choice[key];
    try {
      var value = node._decode(input, options);
      if (input.isError(value))
        return false;

      result = { type: key, value: value };
      match = true;
    } catch (e) {
      input.restore(save);
      return false;
    }
    return true;
  }, this);

  if (!match)
    return input.error('Choice not matched');

  return result;
};

//
// Encoding
//

Node.prototype._createEncoderBuffer = function createEncoderBuffer(data) {
  return new EncoderBuffer(data, this.reporter);
};

Node.prototype._encode = function encode(data, reporter, parent) {
  var state = this._baseState;
  if (state['default'] !== null && state['default'] === data)
    return;

  var result = this._encodeValue(data, reporter, parent);
  if (result === undefined)
    return;

  if (this._skipDefault(result, reporter, parent))
    return;

  return result;
};

Node.prototype._encodeValue = function encode(data, reporter, parent) {
  var state = this._baseState;

  // Decode root node
  if (state.parent === null)
    return state.children[0]._encode(data, reporter || new Reporter());

  var result = null;

  // Set reporter to share it with a child class
  this.reporter = reporter;

  // Check if data is there
  if (state.optional && data === undefined) {
    if (state['default'] !== null)
      data = state['default']
    else
      return;
  }

  // Encode children first
  var content = null;
  var primitive = false;
  if (state.any) {
    // Anything that was given is translated to buffer
    result = this._createEncoderBuffer(data);
  } else if (state.choice) {
    result = this._encodeChoice(data, reporter);
  } else if (state.contains) {
    content = this._getUse(state.contains, parent)._encode(data, reporter);
    primitive = true;
  } else if (state.children) {
    content = state.children.map(function(child) {
      if (child._baseState.tag === 'null_')
        return child._encode(null, reporter, data);

      if (child._baseState.key === null)
        return reporter.error('Child should have a key');
      var prevKey = reporter.enterKey(child._baseState.key);

      if (typeof data !== 'object')
        return reporter.error('Child expected, but input is not object');

      var res = child._encode(data[child._baseState.key], reporter, data);
      reporter.leaveKey(prevKey);

      return res;
    }, this).filter(function(child) {
      return child;
    });
    content = this._createEncoderBuffer(content);
  } else {
    if (state.tag === 'seqof' || state.tag === 'setof') {
      // TODO(indutny): this should be thrown on DSL level
      if (!(state.args && state.args.length === 1))
        return reporter.error('Too many args for : ' + state.tag);

      if (!Array.isArray(data))
        return reporter.error('seqof/setof, but data is not Array');

      var child = this.clone();
      child._baseState.implicit = null;
      content = this._createEncoderBuffer(data.map(function(item) {
        var state = this._baseState;

        return this._getUse(state.args[0], data)._encode(item, reporter);
      }, child));
    } else if (state.use !== null) {
      result = this._getUse(state.use, parent)._encode(data, reporter);
    } else {
      content = this._encodePrimitive(state.tag, data);
      primitive = true;
    }
  }

  // Encode data itself
  var result;
  if (!state.any && state.choice === null) {
    var tag = state.implicit !== null ? state.implicit : state.tag;
    var cls = state.implicit === null ? 'universal' : 'context';

    if (tag === null) {
      if (state.use === null)
        reporter.error('Tag could be omitted only for .use()');
    } else {
      if (state.use === null)
        result = this._encodeComposite(tag, primitive, cls, content);
    }
  }

  // Wrap in explicit
  if (state.explicit !== null)
    result = this._encodeComposite(state.explicit, false, 'context', result);

  return result;
};

Node.prototype._encodeChoice = function encodeChoice(data, reporter) {
  var state = this._baseState;

  var node = state.choice[data.type];
  if (!node) {
    assert(
        false,
        data.type + ' not found in ' +
            JSON.stringify(Object.keys(state.choice)));
  }
  return node._encode(data.value, reporter);
};

Node.prototype._encodePrimitive = function encodePrimitive(tag, data) {
  var state = this._baseState;

  if (/str$/.test(tag))
    return this._encodeStr(data, tag);
  else if (tag === 'objid' && state.args)
    return this._encodeObjid(data, state.reverseArgs[0], state.args[1]);
  else if (tag === 'objid')
    return this._encodeObjid(data, null, null);
  else if (tag === 'gentime' || tag === 'utctime')
    return this._encodeTime(data, tag);
  else if (tag === 'null_')
    return this._encodeNull();
  else if (tag === 'int' || tag === 'enum')
    return this._encodeInt(data, state.args && state.reverseArgs[0]);
  else if (tag === 'bool')
    return this._encodeBool(data);
  else if (tag === 'objDesc')
    return this._encodeStr(data, tag);
  else
    throw new Error('Unsupported tag: ' + tag);
};

Node.prototype._isNumstr = function isNumstr(str) {
  return /^[0-9 ]*$/.test(str);
};

Node.prototype._isPrintstr = function isPrintstr(str) {
  return /^[A-Za-z0-9 '\(\)\+,\-\.\/:=\?]*$/.test(str);
};

},{"../base":19,"minimalistic-assert":760}]