import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30s — Railway free tier can take 20-40s to wake up from sleep
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach token
api.interceptors.request.use(
    (config) => {
        // Token is injected by authStore via setAuthToken()
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data?.message);
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request Timeout — server may be waking up. Please retry.');
            // Attach a friendly message so catch blocks can show it
            error.friendlyMessage = 'Server is waking up, please try again in a few seconds.';
        } else {
            console.error('Network Error:', error.message);
            error.friendlyMessage = 'No internet connection or server unreachable.';
        }
        return Promise.reject(error);
    }
);

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
