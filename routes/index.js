const express = require('express');
const router = express.Router();
const { isUserAuthenticated } = require('../middleware/authMiddleware');
const { listGroups } = require('./auth');
const groupUsers = require('../util/userList');
const userInfo = require('../util/userProfile');
const getMember = require('../util/getMember');
const updatePassword = require('../util/updatePassword');
const md5 = require('md5');
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
  if (process.env.NODE_ENV === 'development') {
    user_email = 'sachin@cloudworker.solutions';
  } else {
    var reqHeader = req.get('x-goog-authenticated-user-email');
    user_email = reqHeader.slice(20);
  }

  const entry = Object.assign({
    severity: 'NOTICE',
    message: `User ${user_email} logged in`,
    component: 'node',
  });

  // Serialize to a JSON string and output.

  await listGroups(user_email)
    .then((response) => {
      res.render('dashboard', {
        groups: response,
      });
    })
    .catch((error) => {
      console.log(Error, error);
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
    pages.push({ page: i * 10, label: i + 1, active: i === from / 10 });

  res.render('groups', {
    members: (members.results || []).filter((result) => result.type === 'USER'),
    total: members.total,
    groupid: groupid,
    from: from,
    pages: pages,
  });
});

router.post('/group/:groupid', isUserAuthenticated, async (req, res) => {
  const groupid = req.params.groupid;
  const memberKey = req.body.searchBar.toLowerCase();

  await getMember(groupid, memberKey)
    .then((response) => {
      console.log(response.status);
      if (response.status !== 200) {
        console.log('Email not found');
      }
      res.render('groups', {
        members: [response.data], //Passing an array since the template expects an array
        total: 1,
        groupid: groupid,
        from: 0,
        pages: null,
        activePage: 0,
      });
    })
    .catch((response) => {
      const status = response.status;

      res.render('groups', {
        groupid: groupid,
        members: [response.data],
        error: 'Email ID Not Found',
        searchTerm: req.body.searchBar,
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

  var response = await updatePassword(memberEmail, password)
    .then((response) => {
      res.render('success', {
        layout: false,
        email: response.data.primaryEmail,
      });
    })
    .catch((response) => {
      res.render('reset-password', {
        layout: false,
        memberEmail: memberEmail,
        error: response.errors[0].message,
      });
    });
});

router.get('/logout', (req, res) => {
  res.redirect('/_gcp_iap/clear_login_cookie');
});

module.exports = router;
