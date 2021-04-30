const { authorizeDirectory } = require('../routes/auth');
const bcrypt = require('bcryptjs');
const md5 = require('md5');
var sha1 = require('sha1');

const updatePassword = async function (userKey, password) {
  console.log('Updating user info');
  const admin = await authorizeDirectory();
  const response = await admin.users.update({
    userKey: userKey,
    requestBody: {
      password: password,
      hashFunction: 'MD5',
    },
  });

  console.log(`${response} from update password page`);

  return response;
};

module.exports = updatePassword;
