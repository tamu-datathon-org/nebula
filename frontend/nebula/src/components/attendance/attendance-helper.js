import React from 'react';
import axios from 'axios';
import { serverCredentials } from '../../config';
import { Select, message } from 'antd';

const serverEndpoint = serverCredentials.endpoint;

export const DEFAULT_SIGN_IN_TYPE = "check_in_19";

const errorHandler = (err) => {
    if (err.response.status === 404) {
        return {
            authorized: true,
            applicant: undefined,
        } 
    } else if (err.response.status === 500) {
        message.error('Something went wrong, can\'t really say what it is.');
        return { authorized: false };
    }
    return { authorized: false, applicant: null };
}

export const getParticipantInfo = async (applicantEmail) => {
    try {
        const response = await axios.get(serverEndpoint+'/applicants?email='+encodeURIComponent(applicantEmail), {withCredentials: true});
        if (response.status === 200) {
            return {
                authorized: true,
                ...response.data
            };
        } 
    } catch (err) { 
        return errorHandler(err);
    }
    return { authorized: false };
}

export const setParticipantSignInStatus = async (applicantEmail, signInStatus, signInType) => {
    try {
        const response = await axios.patch(serverEndpoint+'/applicants/signin', {
            applicantEmail,
            signInStatus,
            signInType,
        }, {withCredentials: true});
        if (response.status === 200) {
            return {
                authorized: true,
                ...response.data
            };
        } 
    } catch (err) { 
        return errorHandler(err);
    }
    return { authorized: false };
}

export const SignInTypeSelector = (props) => (
    <div className="row justify-content-center my-4">
        <Select 
            defaultValue={DEFAULT_SIGN_IN_TYPE} size="large" style={{width: 300}}
            onChange={props.changeSignInType}
        >
            <Select.OptGroup label="Event Check In/Out">
                <Select.Option value="check_in_19">Check In (October 19th)</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Meals">
                <Select.Option value="lunch_19">Lunch (October 19th)</Select.Option>
                <Select.Option value="dinner_19">Dinner (October 19th)</Select.Option>
                <Select.Option value="breakfast_20">Breakfast (October 20th)</Select.Option>
                <Select.Option value="lunch_20">Lunch (October 20th)</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Learner Lessons">
                <Select.Option value="lesson_1">Learner Track Lesson 1</Select.Option>
                <Select.Option value="lesson_2">Learner Track Lesson 2</Select.Option>
                <Select.Option value="lesson_3">Learner Track Lesson 3</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Company Workshops">
                <Select.Option value="stats_workshop">Statistics Department Workshop</Select.Option>
                <Select.Option value="cbre_workshop">CBRE Workshop</Select.Option>
                <Select.Option value="usaa_workshop">USAA Workshop</Select.Option>
                <Select.Option value="math_workshop_1">Math Department Workshop</Select.Option>
                <Select.Option value="facebook_side_event">Facebook Oculus Side Event</Select.Option>
                <Select.Option value="conocophillips_workshop">ConocoPhillips Workshop</Select.Option>
                <Select.Option value="tti_workshop">TTI Workshop</Select.Option>
                <Select.Option value="walmart_workshop">Walmart Workshop</Select.Option>
                <Select.Option value="mlh_cup_stacking">MLH Cup Stacking</Select.Option>
                <Select.Option value="shell_workshop">Shell Workshop</Select.Option>
                <Select.Option value="facebook_workshop">Facebook Workshop</Select.Option>
                <Select.Option value="goldmansachs_workshop">Goldman Sachs Workshop</Select.Option>
                <Select.Option value="zumba_workshop">Zumba Workshop</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="Company Tables">
                <Select.Option value="cbre_table">CBRE Table</Select.Option>
                <Select.Option value="usaa_table">USAA Table</Select.Option>
                <Select.Option value="facebook_table">Facebook Table</Select.Option>
                <Select.Option value="conocophillips_table">ConocoPhillips Table</Select.Option>
                <Select.Option value="tti_table">TTI Table</Select.Option>
                <Select.Option value="walmart_table">Walmart Technology Table</Select.Option>
                <Select.Option value="shell_table">Shell Table</Select.Option>
                <Select.Option value="goldmansachs_table">Goldman Sachs Table</Select.Option>
            </Select.OptGroup>
        </Select>
    </div>
);
