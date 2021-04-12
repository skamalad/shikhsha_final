const express = require('express');
const router = express.Router();
const { isUserAuthenticated } = require('../middleware/authMiddleware');
const {listUsers, listGroups} = require('./auth');
const groupUsers = require('../util/userList');
const userInfo = require('../util/userProfile');
var user_email = "";

// @desc Login/landing page
// @route GET /
router.get('/', isUserAuthenticated, async ( req, res ) => {
    console.log('**** Home Page ****')
    if (process.env.NODE_ENV === 'development') {
        user_email = 'sachin@cloudworker.solutions';
    } else {
        var reqHeader = req.get('x-goog-authenticated-user-email');
        user_email = reqHeader.slice(20);
    }
    const memberInfo = await userInfo(user_email);
    const givenName = memberInfo.data.name.givenName;
    res.render("login", {
        layout: 'login',
        givenName: givenName,
    })
})

// @desc Dashboard
// @route GET /dasboard
router.get('/dashboard', isUserAuthenticated, async( req, res ) => {
    console.log('****** FROM DASHBOARD PAGE **************')
    if (process.env.NODE_ENV === 'development') {
        user_email = 'sachin@cloudworker.solutions';
    } else {
        var reqHeader = req.get('x-goog-authenticated-user-email');
        user_email = reqHeader.slice(20);
    }
    console.log(user_email);
    const groups = await listGroups(user_email);
    // console.log(groups)
    res.render("dashboard", {
        groups: groups
    })
})

// @desc Members of a Group Route
//@route GET /group/groupid
router.get('/group/:groupid', isUserAuthenticated, async (req, res) => {
    const groupid = req.params.groupid;
    console.log(req.headers);
    const members = await groupUsers(groupid);
    res.render("groups", {
        members: members,
        groupid: groupid,
        
    })
    // res.send(`Group ID = ${req.params.groupid}`);
})

// @desc Form to reset password route
// @route GET /reset/:memberid
router.get('/reset/:memberid', isUserAuthenticated, async (req, res) => {
    const memberid = req.params.memberid;
    const memberInfo = await userInfo(memberid);
    console.log(memberInfo.data.name.givenName);
    // console.log(memberInfo);
    res.render('reset-password');
})



module.exports = router;