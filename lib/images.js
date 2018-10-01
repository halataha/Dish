'use strict';
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




const _ = require('underscore');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const flow = require('flow');
const configPath = path.join(__dirname, '..', "config.json");
AWS.config.loadFromPath(configPath);



function getPublicUrl (filename) {
  
  return 'https://s3.us-east-2.amazonaws.com/dishmize/'+filename;
  //return '/recipephotos/'+filename;
}


function sendUploadToGCS (req, res, next) {
  console.log('upload file');
  console.log(req.file);
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

const Multer = require('multer');
const UPLOAD_PATH = '/recipephotos';
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize:0//5 * 1024 * 1024 // no larger than 5mb
  },
   dest: `${UPLOAD_PATH}/` 
});

module.exports = {
  getPublicUrl,
  sendUploadToGCS,
  multer
};



