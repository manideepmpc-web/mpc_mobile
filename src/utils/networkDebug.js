import { API_BASE_URL } from '../constants/config';
import { APP_MODE } from '../config/appMode';
import axios from 'axios';

/**
 * Network Debug Utility - Helps diagnose API connectivity issues
 */
export const networkDebug = {
    /**
     * Test basic connectivity to the backend
     */
    async testConnectivity() {
        console.log('🔍 Testing Network Connectivity...');
        console.log('📊 App Mode:', APP_MODE);
        console.log('🌐 API Base URL:', API_BASE_URL);
        
        if (APP_MODE === 'offline') {
            console.log('✅ Offline mode - No network test needed');
            return { success: true, message: 'Offline mode active' };
        }

        try {
            // Test with a simple GET request to health endpoint or root
            const testUrl = API_BASE_URL.replace('/api', '') + '/health';
            console.log('🚀 Testing URL:', testUrl);
            
            const response = await axios.get(testUrl, {
                timeout: 10000,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'MoneyTracker-Debug/1.0'
                }
            });

            console.log('✅ Connectivity Test Success:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });

            return { 
                success: true, 
                message: 'Backend reachable',
                details: response.data 
            };
        } catch (error) {
            console.error('❌ Connectivity Test Failed:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                isTimeout: error.code === 'ECONNABORTED',
                isNetworkError: !error.response,
                isSSLError: error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
            });

            let errorMessage = 'Network connectivity failed';
            
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout - server may be waking up';
            } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
                errorMessage = 'SSL certificate verification failed';
            } else if (!error.response) {
                errorMessage = 'No internet connection or DNS resolution failed';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error - backend may be down';
            }

            return { 
                success: false, 
                message: errorMessage,
                error: error.message,
                code: error.code
            };
        }
    },

    /**
     * Test the specific registration endpoint
     */
    async testRegistrationEndpoint() {
        console.log('🔍 Testing Registration Endpoint...');
        
        if (APP_MODE === 'offline') {
            console.log('✅ Offline mode - Using local registration');
            return { success: true, message: 'Offline registration' };
        }

        try {
            const testData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Test@12345',
                phone: '1234567890',
                designation: 'Test Developer',
                gender: 'other',
                date_of_birth: '1990-01-01',
                address: 'Test Address'
            };

            console.log('📤 Sending test registration request...');
            
            const response = await axios.post(
                API_BASE_URL + '/auth/register',
                testData,
                {
                    timeout: 15000,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            console.log('✅ Registration Endpoint Test Success:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });

            return { 
                success: true, 
                message: 'Registration endpoint working',
                response: response.data 
            };
        } catch (error) {
            console.error('❌ Registration Endpoint Test Failed:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });

            let errorMessage = 'Registration endpoint test failed';
            
            if (error.response?.status === 422) {
                errorMessage = 'Validation error - endpoint expects different data';
            } else if (error.response?.status === 409) {
                errorMessage = 'Conflict - test email already exists';
            } else if (error.response?.status === 400) {
                errorMessage = 'Bad request - check data format';
            }

            return { 
                success: false, 
                message: errorMessage,
                error: error.message,
                status: error.response?.status,
                backendError: error.response?.data
            };
        }
    },

    /**
     * Get network information
     */
    getNetworkInfo() {
        return {
            appMode: APP_MODE,
            apiBaseUrl: API_BASE_URL,
            isHttps: API_BASE_URL.startsWith('https://'),
            domain: new URL(API_BASE_URL).hostname,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Run all network diagnostics
 */
export const runNetworkDiagnostics = async () => {
    console.log('🏥 Running Network Diagnostics...');
    
    const results = {
        timestamp: new Date().toISOString(),
        networkInfo: networkDebug.getNetworkInfo(),
        connectivityTest: null,
        registrationTest: null
    };

    results.connectivityTest = await networkDebug.testConnectivity();
    results.registrationTest = await networkDebug.testRegistrationEndpoint();

    console.log('📋 Diagnostic Results:', results);
    return results;
};

export default networkDebug;
