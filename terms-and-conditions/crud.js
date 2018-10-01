'use strict';

const express = require('express');
const router = express.Router();

router.get('/',(req,res) => {
    res.render('pages/terms-and-conditions',
               {
        title: "Terms and Conditions",
        sess_val:req.session.user_id
    });
});

module.exports = router;