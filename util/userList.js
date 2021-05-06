const { authorizeDirectory } = require('../routes/auth');

const groupUsers = async function (groupid, from) {
  var members = [];
  var pageToken = '';
  var newPageToken = '';
  const admin = await authorizeDirectory();

  const resp = await admin.members.list({
    groupKey: groupid,
  });
  members = resp.data.members;
  // console.log(members);
  //   console.log(members);
  //   members = resp.data.members;
  const total = members.length;
  return { results: members.splice(from, 10), total };
};

module.exports = groupUsers;
