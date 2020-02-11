const express = require('express');
const router = express.Router();
const HTTPCodes = require('../libs/helper-lib').HTTPCodes;
const verifyParamsExist = require('../libs/helper-lib').verifyParamsExist;
const Applicants = require('./schema').applicants;
const Stats = require('./schema').stats;
const checkAdminToken = require('./auth-helper').checkAdminToken;
const {Parser: CsvParser} = require('json2csv');

const ALLOWED_APPLICATION_STATUS = new Set(["Pending", "Accepted", "Rejected", "RSVP'ed"]);

const primeApplicantForReviewer = (applicant, reviewer) => {
    if (!(applicant.reviewers.includes(reviewer))) {
        return undefined;
    }
    const reviewerIndex = applicant.reviewers.indexOf(reviewer);
    const reviewed = applicant.reviewsLeft.indexOf(reviewer) === -1;
    const reviewerScore = applicant.scores[reviewerIndex];
    delete applicant.reviewsLeft;
    delete applicant.reviewers;
    delete applicant.scores;
    applicant.score = reviewerScore;
    applicant.reviewed = reviewed;
    return applicant;
}

const ALLOWED_APPLICANT_FIELDS = ["firstName", "lastName", "track", "applicationStatus", "major", "university", "signInStatus", "email", "dietaryRestriction", "resumeLink"];

const removeCriticalInfoFromApplicant = (applicant) => {
    const filteredApp = {};
    ALLOWED_APPLICANT_FIELDS.forEach(field => filteredApp[field] = applicant[field]);
    return filteredApp;
}

// All applicant requests must be authorized.
router.use(async (req, res, next) => {
    const admin = await checkAdminToken(req);
    if (admin === undefined) {
        return res.status(HTTPCodes.UNAUTHORIZED).json({err: 'User not authorized'});
    }
    if (admin.username === undefined || admin.username === null) {
        return res.status(HTTPCodes.BAD_REQUEST).send('Admin user does not have a username')
    }
    res.locals.username = admin.username;
    next();
});

router.get('', async (req, res) => {
    if (!verifyParamsExist(req.query, ['email'])){
        return res.status(HTTPCodes.BAD_REQUEST).send(JSON.stringify({err: "Request body does not contain needed values: [email]"}));
    }
    try {
        const applicant = await Applicants.findOne({email: req.query.email}).lean();
        if (applicant === undefined || applicant === null) {
            return res.status(HTTPCodes.NOT_FOUND).send('Applicant not found');
        }
        return res.status(HTTPCodes.SUCCESS).json({ applicant: removeCriticalInfoFromApplicant(applicant) });
    } catch (err) {
        console.log(err);
        return res.status(HTTPCodes.SERVER_ERROR).send();
    }
})

router.get('/random', async (req, res) => {
    const reviewer = res.locals.username;
    const numUnreviewed = await Applicants.find({ 
        reviewsLeft: reviewer,
    }).countDocuments();
    if (numUnreviewed == 0) {
        return res.status(HTTPCodes.NOT_FOUND).send();
    }
    const randomSkip = Math.floor(Math.random() * numUnreviewed);
    const applicant = await Applicants.findOne({ 
        reviewsLeft: reviewer,
    }).skip(randomSkip).lean();
    
    return res.status(HTTPCodes.SUCCESS).json({applicant: primeApplicantForReviewer(applicant, reviewer)});
});

router.get('/stats', async (req, res) => {
    const stats = await Stats.findOne({'statsId': 'voyagerStats'});
    res.status(HTTPCodes.SUCCESS).json(stats);
});

router.patch('/status', async (req, res) => {
    if (!verifyParamsExist(req.body, ['applicationStatus', 'applicantEmail'])){
        return res.status(HTTPCodes.BAD_REQUEST).send(JSON.stringify({err: "Request body does not contain needed values: [applicationStatus, applicantEmail]"}));
    }
    const newApplicationStatus = req.body.applicationStatus;
    if (!ALLOWED_APPLICATION_STATUS.has(newApplicationStatus)) {
        return res.status(HTTPCodes.BAD_REQUEST).send(JSON.stringify({err: "Given value of applicationStatus not allowed."}));
    }
    try {
        const applicant = await Applicants.findOneAndUpdate({email: req.body.applicantEmail}, {applicationStatus: newApplicationStatus});
        applicant.applicationStatus = newApplicationStatus;
        res.status(HTTPCodes.SUCCESS).json(applicant);
    } catch (err) {
        console.log(err);
        res.status(HTTPCodes.SERVER_ERROR).send();
    }
});

router.patch('/scores', async(req, res) => {
    if (!verifyParamsExist(req.body, ['newScores', 'applicantEmail'])){
        return res.status(HTTPCodes.BAD_REQUEST).send(JSON.stringify({err: "Request body does not contain needed values: [applicationStatus, applicantEmail]"}));
    }
    const adminUsername = res.locals.username;
    try {
        let applicant = await Applicants.findOne({email: req.body.applicantEmail}).lean();
        if (applicant === undefined || applicant === null) {
            return res.status(HTTPCodes.NOT_FOUND).send('Applicant not found');
        }
        const reviewerIndex = applicant.reviewers.indexOf(adminUsername);
        applicant.reviewsLeft = applicant.reviewsLeft.filter((reviewer) => reviewer !== adminUsername);
        applicant.scores[reviewerIndex] = req.body.newScores;
        applicant.reviewTimestamp[reviewerIndex] = Math.floor(new Date() / 1000); // Get current unix timestamp
        await Applicants.findOneAndUpdate({email: req.body.applicantEmail}, {$set: applicant}).lean();
        return res.status(HTTPCodes.SUCCESS).json({
            applicant: primeApplicantForReviewer(applicant, adminUsername)
        });
    } catch (err) { 
        console.log(err);
        res.status(HTTPCodes.SERVER_ERROR).send();
    }
});

const allowedSignInTypes = ["check_in_19", "lunch_19", "dinner_19", "breakfast_20", "lunch_20", "lesson_1", "lesson_2", "lesson_3", "cbre_workshop", "usaa_workshop", "facebook_side_event", "conocophillips_workshop", "tti_workshop", "mlh_cup_stacking", "shell_workshop", "facebook_workshop", "goldmansachs_workshop", "stats_workshop", "math_workshop_1", "walmart_workshop", "zumba_workshop", "cbre_table", "usaa_table", "facebook_table", "conocophillips_table", "tti_table", "shell_table", "goldmansachs_table", "walmart_table"];

router.patch('/signin', async(req, res) => {
    if (!verifyParamsExist(req.body, ['signInType', 'signInStatus', 'applicantEmail'])){
        return res.status(HTTPCodes.BAD_REQUEST).send(JSON.stringify({err: "Request body does not contain needed values: [signInType, signInStatus, applicantEmail]"}));
    }
    try {
        let applicant = await Applicants.findOne({email: req.body.applicantEmail}).lean();
        if (applicant === undefined || applicant === null) {
            return res.status(HTTPCodes.NOT_FOUND).send('Applicant not found');
        }

        if (!allowedSignInTypes.includes(req.body.signInType)) {
            return res.status(HTTPCodes.BAD_REQUEST).send('Given signInType is not supported');
        }

        applicant.signInStatus[req.body.signInType] = req.body.signInStatus;

        await Applicants.findOneAndUpdate({email: req.body.applicantEmail}, {$set: applicant}).lean();
        return res.status(HTTPCodes.SUCCESS).json({
            applicant: removeCriticalInfoFromApplicant(applicant)
        });
    } catch (err) { 
        console.log(err);
        res.status(HTTPCodes.SERVER_ERROR).send();
    }
});

router.get('/search', async (req, res) => {
    if (!verifyParamsExist(req.query, ['query'])) {
        return res.status(HTTPCodes.BAD_REQUEST).send(JSON.stringify({err: "Request query must contain ['query']"}));
    }
    const reviewer = res.locals.username;
    try {
        const foundApplicants = await Applicants.find({
            '$text': {'$search': req.query.query} ,
            reviewers: reviewer,
        }).limit(10);
        return res.status(HTTPCodes.SUCCESS).json(foundApplicants);
    } catch (err) {
        return res.status(HTTPCodes.SERVER_ERROR).send();
    }
});

const camelCaseToNormal = (value) =>
    value.replace(/([A-Z])/g, ' $1')
        .replace(/^./, function(str){ return str.toUpperCase(); });

const prepareApplicantsForCsv = (applicants) => {
    applicants.forEach((applicant) => {
        const score1 = Object.values(applicant.scores[0]).reduce((a, b) => a+b, 0)
        const score2 = Object.values(applicant.scores[1]).reduce((a, b) => a+b, 0)
        delete applicant.reviewers;
        delete applicant.reviewsLeft;
        delete applicant.scores;
        applicant.score1 = score1;
        applicant.score2 = score2;
    });
    return applicants;
};

router.get('/csv', async (req, res) => {
    const fields = req.query.fields;
    const applicants = await Applicants.find().lean();
    const json2csvParser = new CsvParser({ fields: fields.concat(['score1', 'score2']) });
    const csv = json2csvParser.parse(prepareApplicantsForCsv(applicants));
    res.attachment('TAMU Datathon Applicants.csv');
    res.set('Content-Type', 'text/csv');
    res.status(HTTPCodes.SUCCESS).send(csv);
});

module.exports = router;