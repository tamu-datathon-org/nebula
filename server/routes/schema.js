var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Applicant = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    gender: {type: String, required: true},
    university: {type: String, required: true},
    classification: {type: String, required: true},
    major: {type: String, required: true},
    firstGenStudent: {type: String, required: true},
    ethnicity: {type: String, required: true},
    track: {type: String, required: true},
    experience: {type: String, required: true},
    expectation: {type: String, required: true},
    isInTeam: {type: String, required: true},
    resumeLink: {type: String, required: true},
    applicationStatus: {type: String, required: true},
    extraLinks: {type: String, required: true},
    reviewers: {type: [String], required: true},
    reviewsLeft: {type: [String], required: true},
    scores: {type: [Map], required: true},
    reviewTimestamp: {type: [Number], required: true},
    signInStatus: {type: Map, required: true},
});

var Admin = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    key: {type: String, required: true},
    accessToken: {type: String, required: true},
    accessTokenExpiration: {type: String, required: true},
});

var Statistics = new Schema({
    statsId: {type: String, required: true},
    totalApplicants: {type: Number, required: true},
    totalAssigned: {type: Map, of: Number, required: true},
    totalReviewed: {type: Map, of: Number, required: true},
});

module.exports = {
    applicants: mongoose.model('applicant', Applicant),
    admins: mongoose.model('admin', Admin),
    stats: mongoose.model('statistics', Statistics),
}