const { authorizeDirectory } = require('../routes/auth');

const updatePassword = async function (userKey, password) {
  console.log('Updating user info');
  const admin = await authorizeDirectory();
  const response = await admin.users.update({
    userKey: userKey,
    requestBody: {
      password: password,
    },
  });
  console.log(`${response} from update password page`);

  return response;
};

module.exports = updatePassword;
