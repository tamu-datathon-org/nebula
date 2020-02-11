const express = require('express');
const router = express.Router();
const moment = require('moment')
const randomToken = require('random-token');
const HTTPCodes = require('../libs/helper-lib').HTTPCodes;
const verifyParamsExist = require('../libs/helper-lib').verifyParamsExist;
const checkAdminToken = require('./auth-helper').checkAdminToken;
const Admins = require('./schema').admins;
const Applicants = require('./schema').applicants;

const MAX_TOKEN_AGE = 2 * 60 * 60 * 60 * 1000 // 2 days in milliseconds
const TOKEN_SIZE = 32;

// Route: /admins
router.post('', async (req, res) => {
    if (!verifyParamsExist(req.body, ['adminKey'])) {
        return res.status(HTTPCodes.BAD_REQUEST).send(JSON.stringify({
            err: 'Request body needs to have the keys: [adminKey]'
        }))
    }
    try {
        let adminToken = randomToken(TOKEN_SIZE);
        // Allow multiple logins with same access token
        const admin = await Admins.findOne({
            'key': req.body.adminKey
        }).lean();
        if (admin === null) {
            return res.status(HTTPCodes.UNAUTHORIZED).json({
                err: 'No administrator exists with that key.'
            })
        }
        // Check if access token expired
        if (admin.accessTokenExpiration === undefined || admin.accessTokenExpiration === null || moment(admin.accessTokenExpiration).isBefore(moment())) {
            await Admins.findOneAndUpdate({
                'key': req.body.adminKey
            }, {
                accessToken: adminToken,
                accessTokenExpiration: moment().add(MAX_TOKEN_AGE, 'ms').format()
            }).lean();
        } else {
            adminToken = admin.accessToken;
        }
        res.cookie('td_token', adminToken, {
            maxAge: MAX_TOKEN_AGE
        });
        return res.status(HTTPCodes.SUCCESS).json({
            firstName: admin.firstName,
            lastName: admin.lastName,
        });
    } catch (err) {
        console.log(err);
        res.status(HTTPCodes.SERVER_ERROR).send();
    }
});

router.get('/num_reviews', async (req, res) => {
    const admin = await checkAdminToken(req);
    if (admin === undefined) {
        return res.status(HTTPCodes.UNAUTHORIZED).json({
            err: 'User not authorized'
        });
    }
    if (admin.username === undefined || admin.username === null) {
        return res.status(HTTPCodes.BAD_REQUEST).send('Admin user does not have a username')
    }
    const reviewers = await Admins.find().lean();
    let curReviewerStats = {};
    let reviewStats = {};
    for (let index = 0; index < reviewers.length; index++) {
        const reviewer = reviewers[index];
        const assignedApplicants = await Applicants.find({
            reviewers: reviewer.username,
            applicationStatus: 'Pending',
        }).countDocuments();
        const unreviewedApplicants = await Applicants.find({
            reviewsLeft: reviewer.username,
            applicationStatus: 'Pending',
        }).countDocuments();
        reviewStats[`${reviewer.firstName} ${reviewer.lastName}`] = {
            totalAssigned: assignedApplicants,
            totalReviewed: assignedApplicants - unreviewedApplicants,
        }
        if (reviewer.username === admin.username) {
            curReviewerStats = {
                totalAssigned: assignedApplicants,
                totalReviewed: assignedApplicants - unreviewedApplicants,
            };
        }
    }
    return res.status(200).json({
        reviewStats,
        curReviewerStats
    });
});

router.get('/review_stats', async (req, res) => {
    const admin = await checkAdminToken(req);
    if (admin === undefined) {
        return res.status(HTTPCodes.UNAUTHORIZED).json({
            err: 'User not authorized'
        });
    }
    if (admin.username === undefined || admin.username === null) {
        return res.status(HTTPCodes.BAD_REQUEST).send('Admin user does not have a username')
    }
    return res.status(200).json({
        reviewStats
    });
});

router.delete('', async (req, res) => {
    try {
        const adminCheck = checkAdminToken(req);
        if (!adminCheck) {
            return res.status(HTTPCodes.UNAUTHORIZED).json({
                err: 'No administrator exists with that key.'
            })
        } else {
            await Admins.findOneAndUpdate({
                'accessToken': req.cookies.td_token
            }, {
                '$unset': {
                    accessToken: null,
                    accessTokenExpiration: null
                }
            });
            return res.status(HTTPCodes.SUCCESS).send();
        }
    } catch (err) {
        console.log(err);
        res.status(HTTPCodes.SERVER_ERROR).send();
    }
});

module.exports = router;