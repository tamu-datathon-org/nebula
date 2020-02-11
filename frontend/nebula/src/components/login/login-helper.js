import axios from 'axios';
import { serverCredentials } from '../../config';

const serverEndpoint = serverCredentials.endpoint;

export const loginAdmin = async (adminKey) => {
    try {
        const response = await axios.post(serverEndpoint+'/admins', {
            adminKey: adminKey,
        }, {
            withCredentials: true,
        });
        if (response.status === 200) {
            return {
                authorized: true,
                ...response.data
            };
        }
    } catch (err) {
        return { authorized: false };
    }
    return { authorized: false };
}

export const logoutAdmin = async () => {
    await axios.delete(serverEndpoint+'/admins');
};