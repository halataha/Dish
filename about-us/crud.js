
const express = require('express');
//const _ = require('underscore');
function getModel() {
    return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

router.use((req, res, next) => {
    res.set('Content-Type', 'text/html');
    next();
});

router.get('/', (req, res, next) => {
    
    res.render('pages/about', {
            title: "About Us",
            sess_val: req.session.user_id
        });
});

module.exports = router;
