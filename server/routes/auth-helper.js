const Admins = require('./schema').admins;
const moment = require('moment');

const checkAdminToken = async (req) => {
    if (req.cookies.td_token === undefined) return undefined;
    const admin = await Admins.findOne({'accessToken': req.cookies.td_token}).lean();
    if (admin == undefined || admin.accessTokenExpiration === undefined) return undefined;
    return (!moment().isAfter(admin.accessTokenExpiration)) ? admin : undefined;
};

module.exports = {
    checkAdminToken
}