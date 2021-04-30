const { authorizeDirectory } = require('../routes/auth');

const getMember = async function (groupid, useremail) {
  const admin = await authorizeDirectory();

  const user = admin.members.get({
    groupKey: groupid,
    memberKey: useremail,
  });

  console.log(user);
  return user;
};

module.exports = getMember;
