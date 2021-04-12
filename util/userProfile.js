const {authorizeDirectory} = require('../routes/auth')

const userInfo = async function(memberid) {
    const admin = await authorizeDirectory()

    const resp = await admin.users.get({
        userKey: memberid
    })
    return resp;
}

module.exports = userInfo;