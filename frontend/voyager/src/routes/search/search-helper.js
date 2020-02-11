import axios from 'axios';
import { serverCredentials } from '../../config';

const serverEndpoint = serverCredentials.endpoint;

export const getApplicantData = async (email) => {
    try {
        const response = await axios.get(serverEndpoint+'/applicants?email='+encodeURIComponent(email), {withCredentials: true});
        return response;
    } catch (err) {
        return err.response;
    }
}