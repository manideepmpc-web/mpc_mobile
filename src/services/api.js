import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { sessionManager } from '../utils/sessionManager';
import { isOnlineMode } from '../config/appMode';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30s — Railway free tier can take 20-40s to wake up from sleep
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach token automatically
api.interceptors.request.use(
    async (config) => {
        // Only attach token for online mode
        if (isOnlineMode()) {
            try {
                const token = await sessionManager.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.warn('⚠️ Failed to get auth token:', error);
            }
        }
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

// Initialize auth token from session (call this on app start)
export const initializeAuthToken = async () => {
    if (isOnlineMode()) {
        try {
            const token = await sessionManager.getToken();
            if (token) {
                setAuthToken(token);
                console.log('✅ Auth token initialized from session');
            }
        } catch (error) {
            console.warn('⚠️ Failed to initialize auth token:', error);
        }
    }
};

// OLD: Manual token setting (preserved for compatibility)
// export const setAuthToken = (token) => {
//     if (token) {
//         api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     } else {
//         delete api.defaults.headers.common['Authorization'];
//     }
// };

// Updated setAuthToken function
export const setAuthToken = async (token) => {
    if (isOnlineMode() && token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('✅ Auth token set for API requests');
    } else {
        delete api.defaults.headers.common['Authorization'];
        console.log('🗑️ Auth token cleared');
    }
};

export default api;
