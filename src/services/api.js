import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { sessionManager } from '../utils/sessionManager';
import { isOnlineMode } from '../config/appMode';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 45000, // Increased to 45s — Railway free tier can take 20-40s to wake up from sleep
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MoneyTracker-ReactNative/1.0'
    },
    // Enable SSL certificate verification bypass for development (remove in production)
    // httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Uncomment if needed for SSL issues
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
                
                // Enhanced logging for debugging
                console.log('🚀 API Request:', {
                    method: config.method?.toUpperCase(),
                    url: config.baseURL + config.url,
                    headers: config.headers,
                    data: config.data,
                    params: config.params,
                    timeout: config.timeout
                });
            } catch (error) {
                console.warn('⚠️ Failed to get auth token:', error);
            }
        }
        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor — global error handling
api.interceptors.response.use(
    (response) => {
        // Enhanced logging for successful responses
        console.log('✅ API Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config?.url,
            method: response.config?.method?.toUpperCase(),
            data: response.data
        });
        return response;
    },
    (error) => {
        // Enhanced error logging
        console.error('❌ API Error Details:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            requestData: error.config?.data,
            responseData: error.response?.data,
            headers: error.config?.headers,
            isTimeout: error.code === 'ECONNABORTED',
            isNetworkError: !error.response,
            isServerError: error.response?.status >= 500,
            isClientError: error.response?.status >= 400 && error.response?.status < 500
        });
        
        if (error.response) {
            console.error('🔍 Backend Response:', error.response.data);
        } else if (error.code === 'ECONNABORTED') {
            console.error('⏰ Request Timeout — server may be waking up. Please retry.');
            // Attach a friendly message so catch blocks can show it
            error.friendlyMessage = 'Server is waking up, please try again in a few seconds.';
        } else {
            console.error('🌐 Network Error:', error.message);
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
