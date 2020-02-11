import axios from 'axios';
import { serverCredentials } from '../../config';

const serverEndpoint = serverCredentials.endpoint;

const getRequest = async (path, data) => {
    try {
        if (data === undefined) {
            return await axios.get(serverEndpoint+path, {
                'Access-Control-Allow-Origin': '*',
                withCredentials: true});
        }
        return await axios.get(serverEndpoint+path, data, {
            'Access-Control-Allow-Origin': '*',
            withCredentials: true});
    } catch (err) {
        return err.response;
    }
}

const patchRequest = async (path, data) => {
    try {
        if (data === undefined) {
            return await axios.patch(serverEndpoint+path, {
                'Access-Control-Allow-Origin': '*',
                withCredentials: true});
        }
        return await axios.patch(serverEndpoint+path, data, {
            'Access-Control-Allow-Origin': '*',
            withCredentials: true});
    } catch (err) {
        return err.response;
    }
}

export const getRandomApplicant = async () => {
    return await getRequest('/applicants/random');
}

export const setApplicantStatus = async (applicationStatus, applicantEmail) => {
    return await patchRequest('/applicants/status', {
        applicationStatus,
        applicantEmail,
    });
}

export const setApplicantScores = async (newScores, applicantEmail) => {
    return await patchRequest('/applicants/scores', {
        newScores,
        applicantEmail,
    });
}

export const getApplicantStats = async() => {
    return await getRequest('/applicants/stats');
}

export const getNumReviews = async() => {
    return await getRequest('/admins/num_reviews');
}

export const getReviewStats = async() => {
    return await getRequest('/admins/review_stats');
}