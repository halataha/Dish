'use strict';

const express = require('express');
const router = express.Router();

router.get('/404',(req,res) => {
    res.render('pages/404',
               {
        title: "404",
        sess_val:req.session.user_id
    });
});
router.get('/500',(req,res) => {
    res.render('pages/500',
               {
        title: "500",
        sess_val:req.session.user_id
    });
});

module.exports = router;