const {authorizeDirectory} = require('../routes/auth')

const groupUsers = async function(groupid) {
    var members = []
    const admin = await authorizeDirectory()

    const resp = await admin.members.list({
        groupKey: groupid
    })
    members = resp.data.members;
    console.log(members)
    return members;
}

module.exports = groupUsers;