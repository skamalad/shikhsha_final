const { authorizeDirectory } = require('../routes/auth');

const userInfo = async function (memberid) {
  const admin = await authorizeDirectory();

  try {
    const resp = await admin.users.get({
      userKey: memberid,
    });

    return resp;
  } catch (error) {
    return Error;
  }
};

module.exports = userInfo;
