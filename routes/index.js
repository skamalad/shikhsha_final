const express = require('express');
const router = express.Router();
const { audience, validateAssertion } = require('../middleware/IAPauth');
const {listUsers, listGroups} = require('./auth');

var user_email = "";
// @desc Login/landing page
// @route GET /
router.get('/', async ( req, res ) => {
    const assertion = req.header('X-Goog-IAP-JWT-Assertion');
    let email = 'None';
    try {
        const info = await validateAssertion(assertion);
        email = info.email;
    }
    catch (error) {
        console.log(error);
    }
    // res.send(`Hello ${email}`);
    console.log('**** Home Page ****')
    console.log(email);
    // console.log(JSON.stringify(req.headers)); Can be deleted
    res.render("login", {
        layout: 'login',
        email: email
    })
})

// @desc Dashboard
// @route GET /dasboard
router.get('/dashboard', async( req, res ) => {
    console.log('****** FROM DASHBOARD PAGE **************')
    console.log(req.headers);
    // await listUsers(res);
    
    if (process.env.NODE_ENV === 'development') {
        user_email = 'sachin@cloudworker.solutions';
    } else {
        var reqHeader = req.get('x-goog-authenticated-user-email');
        user_email = reqHeader.slice(20);
    }
    // const user_email = "accounts.google.com:sachin@cloudworker.solutions";
    console.log(user_email);
    const groups = await listGroups(user_email);
    console.log(groups)
    res.render("dashboard", {
        groups: groups
    })
})



module.exports = router;