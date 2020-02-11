const express = require('express');
const router = express.Router();
const HTTPCodes = require('../libs/helper-lib').HTTPCodes;
const Applicants = require('./schema').applicants;
const {Parser: CsvParser} = require('json2csv');

// TODO -------- THIS SHOULD REQUIRE AUTHENTICATION

APPLICANT_CSV_FIELDS = [];

const preprocessApplicantsForCsv = (applicants) => {
    let reviewerScores = {};
    let reviewerTotalReviews = {};
    // Get reviewer total scores
    applicants.forEach((applicant) => {
        for (let i = 0; i < applicant.reviewers.length; i++) {
            const reviewer = applicant.reviewers[i];
            if (!(reviewer in reviewerScores)) {
                reviewerTotalReviews[reviewer] = 0;
                reviewerScores[reviewer] = {}
                Object.keys(applicant.scores[i]).forEach(scoreType => reviewerScores[reviewer][scoreType] = 0);
            }
            reviewerTotalReviews[reviewer] += 1;
            Object.keys(applicant.scores[i]).forEach(scoreType => reviewerScores[reviewer][scoreType] += applicant.scores[i][scoreType])
        }
    });
    // Get reviewer mean scores
    Object.keys(reviewerTotalReviews).forEach((reviewer) => {
        const totalReviews = reviewerTotalReviews[reviewer];
        Object.keys(reviewerScores[reviewer]).forEach(scoreType => reviewerScores[reviewer][scoreType] = reviewerScores[reviewer][scoreType] / totalReviews)
    });

    // Get reviewer variance
    let reviewerStdDev = {}
    applicants.forEach((applicant) => {
        for (let i = 0; i < applicant.reviewers.length; i++) {
            const reviewer = applicant.reviewers[i];
            if (!(reviewer in reviewerStdDev)) {
                reviewerStdDev[reviewer] = {}
                Object.keys(applicant.scores[i]).forEach(scoreType => reviewerStdDev[reviewer][scoreType] = 0);
            }
            Object.keys(applicant.scores[i]).forEach(scoreType => reviewerStdDev[reviewer][scoreType] += Math.pow(reviewerScores[reviewer][scoreType] - applicant.scores[i][scoreType], 2));
        }
    });
    // Get reviewer standard deviation
    Object.keys(reviewerTotalReviews).forEach((reviewer) => {
        const totalReviews = reviewerTotalReviews[reviewer];
        Object.keys(reviewerStdDev[reviewer]).forEach(key => reviewerStdDev[reviewer][key] = Math.pow(reviewerStdDev[reviewer][key] / totalReviews, 0.5))
    });

    // Add each score to applicant object to put into csv
    applicants.forEach((applicant) => {
        for (let i = 0; i < applicant.reviewers.length; i++) {
            const reviewer = applicant.reviewers[i];
            Object.keys(applicant.scores[i]).forEach((scoreType) => {
                applicant[`${scoreType}_${i}`] = applicant.scores[i][scoreType];
                applicant[`debias_mean_${scoreType}_${i}`] = reviewerScores[reviewer][scoreType];
                applicant[`debias_stddev_${scoreType}_${i}`] = reviewerStdDev[reviewer][scoreType];
            });
            applicant[`reviewer_${i}`] = reviewer;
        }

        delete applicant.reviewers;
        delete applicant.reviewsLeft;
        delete applicant.scores;
        delete applicant.reviewTimestamp;
    });

    return applicants;
};

router.get('/', async (req, res) => {
    const applicants = await Applicants.find().lean();
    const reviewedApplicants = applicants.filter(applicant => applicant.reviewsLeft.length == 0);
    const processedApplicants = preprocessApplicantsForCsv(reviewedApplicants);
    const fields = Object.keys(processedApplicants[0]);
    const json2csvParser = new CsvParser({ fields });
    const csv = json2csvParser.parse(processedApplicants);
    res.attachment('TAMU Datathon Applicants.csv');
    res.set('Content-Type', 'text/csv');
    res.status(HTTPCodes.SUCCESS).send(csv);
})

module.exports = router;