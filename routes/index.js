const express = require('express');
const router = express.Router();
const { isUserAuthenticated } = require('../middleware/authMiddleware');
const { listUsers, listGroups } = require('./auth');
const groupUsers = require('../util/userList');
const userInfo = require('../util/userProfile');
const getMember = require('../util/getMember');
const updatePassword = require('../util/updatePassword');
const md5 = require('md5');
var sha1 = require('sha1');
const { validationResult } = require('express-validator');
const { validateConfirmPassword } = require('../middleware/validator');
var cache = require('../util/memoryCache');
const { response } = require('express');

var user_email = '';

// @desc Login/landing page
// @route GET /
router.get('/', isUserAuthenticated, async (req, res) => {
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    user_email = 'sachin@cloudworker.solutions';
  } else {
    var reqHeader = req.get('x-goog-authenticated-user-email');
    user_email = reqHeader.slice(20);
  }
  const memberInfo = await userInfo(user_email);
  const givenName = memberInfo.data.name.givenName;
  res.render('login', {
    layout: 'login',
    givenName: givenName,
  });
});

// @desc Dashboard
// @route GET /dasboard
router.get('/dashboard', isUserAuthenticated, async (req, res) => {
  console.log('****** FROM DASHBOARD PAGE **************');
  if (process.env.NODE_ENV === 'development') {
    user_email = 'sachin@cloudworker.solutions';
  } else {
    var reqHeader = req.get('x-goog-authenticated-user-email');
    user_email = reqHeader.slice(20);
  }
  console.log(user_email);
  const groups = await listGroups(user_email);
  // console.log(groups)
  res.render('dashboard', {
    groups: groups,
  });
});

// @desc Members of a Group Route
//@route GET /group/groupid
router.get('/group/:groupid', isUserAuthenticated, async (req, res) => {
  const groupid = req.params.groupid;
  const from = parseInt(req.query.from || 0, 10) || 0;
  const members = await groupUsers(groupid, from);

  const pages = [];
  for (var i = 0; i < Math.ceil(members.total / 10); i++)
    pages.push({ page: i * 10, label: i + 1 });

  res.render('groups', {
    members: members.results,
    total: members.total,
    groupid: groupid,
    from: from,
    pages: pages,
  });
  // res.send(`Group ID = ${req.params.groupid}`);
});

router.post('/group/:groupid', isUserAuthenticated, async (req, res) => {
  const groupid = req.params.groupid;
  const memberKey = req.body.searchBar;

  await getMember(groupid, memberKey)
    .then((response) => {
      res.render('groups', {
        members: [response.data], //Passing an array since the template expects an array
        total: 1,
        groupid: groupid,
        from: null,
        pages: null,
      });
    })
    .catch((response) => {
      console.log(response);
      res.render('groups', {
        groupid: groupid,
        error: 'Email ID Not Found',
      });
    });
});

// @desc Form to reset password route
// @route GET /reset/:memberid
router.get('/reset/:memberid', isUserAuthenticated, async (req, res) => {
  const memberid = req.params.memberid;
  const memberInfo = await userInfo(memberid);
  const memberEmail = memberInfo.data.primaryEmail;
  res.render('reset-password', {
    layout: false,
    memberEmail: memberEmail,
  });
});

router.post('/reset', async (req, res) => {
  const memberEmail = req.body.username;
  const password = await md5(req.body.password);
  // const password = req.body.password;
  console.log(password);
  // const confPassword = req.body.confPassword;
  // const errors = await validationResult(req);
  // const memberInfo = await userInfo(memberEmail);

  var response = await updatePassword(memberEmail, password)
    .then((response) => {
      console.log('All good');
      console.log(response);
      res.render('success', {
        layout: false,
        email: response.data.primaryEmail,
      });
    })
    .catch((response) => {
      console.log(response.errors);
      res.render('reset-password', {
        layout: false,
        memberEmail: memberEmail,
        error: response.errors[0].message,
      });
    });
});

router.get('/logout', (req, res) => {
  // req.logOut();
  res.redirect('/_gcp_iap/clear_login_cookie');
});

module.exports = router;
