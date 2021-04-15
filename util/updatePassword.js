const { response } = require('express');
const { authorizeDirectory } = require('../routes/auth');

const updatePassword = async function (userKey, password) {
  const admin = await authorizeDirectory();

  const resp = await admin.users.update(
    {
      userKey: userKey,
      requestBody: {
        password: password,
      },
    },
    (err) => {
      console.log('from the update password js file');
      if (response.status === 400) {
        // console.log(err);
        console.log('Error in password');
      }
      //   console.log(err);
    }
  );

  return resp;
};

module.exports = updatePassword;
