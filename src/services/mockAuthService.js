// src/services/mockAuthService.js
// Mock authentication service for demo/testing without backend

const DEMO_CREDENTIALS = {
    'test@mpc.com': 'mpc@123',
    'mpc_hyd@moneytracker.com': 'mpc_hyd@1',
};

const DEMO_USERS = {
    'test@mpc.com': {
        id: 1,
        employee_id: 'TEST001',
        name: 'Test User',
        email: 'test@mpc.com',
        phone: '9999999999',
        department_id: 1,
        designation: 'Test Admin',
        role: 'admin',
        date_of_joining: '2026-04-16',
        gender: 'male',
        is_active: 1,
    },
    'mpc_hyd@moneytracker.com': {
        id: 0,
        employee_id: 'MT001',
        name: 'Money Tracker Admin',
        email: 'mpc_hyd@moneytracker.com',
        phone: '9000000000',
        department_id: 1,
        designation: 'Money Tracker Admin',
        role: 'admin',
        date_of_joining: '2026-04-13',
        gender: 'male',
        is_active: 1,
    },
};

// Generate a mock JWT token
const generateMockToken = (user) => {
    // Simulated JWT (not real, just for demo)
    const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'; // Base64 for {"alg":"HS256","typ":"JWT"}
    const payload = `mock_payload_for_${user.id}`;
    const signature = 'demo_signature';
    return `${header}.${payload}.${signature}`;
};

export const mockAuthService = {
    // Mock login - checks demo credentials
    login: async (email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const validPassword = DEMO_CREDENTIALS[email];
                
                if (validPassword && validPassword === password) {
                    const user = DEMO_USERS[email];
                    const token = generateMockToken(user);
                    
                    resolve({
                        data: {
                            success: true,
                            message: 'Login successful (Demo Mode - No Backend).',
                            data: {
                                token,
                                employee: user,
                            },
                        },
                    });
                } else {
                    resolve({
                        data: {
                            success: false,
                            message: 'Invalid email or password.',
                        },
                        status: 401,
                    });
                }
            }, 1500); // Simulate network delay
        });
    },

    // Mock getMe - returns current user
    getMe: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        success: true,
                        message: 'Profile fetched (Demo Mode).',
                        data: DEMO_USERS['test@mpc.com'],
                    },
                });
            }, 1000);
        });
    },

    // Mock register
    register: async (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        success: true,
                        message: 'User registered successfully (Demo Mode).',
                        data: {
                            employee_id: 'DEMO' + Math.floor(Math.random() * 10000),
                            otp_sent: false, // No actual email sent in demo
                        },
                    },
                });
            }, 1000);
        });
    },

    // Mock OTP verification
    verifyOTP: async (email, otp_code) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: {
                        success: true,
                        message: 'OTP verified ✅ (Demo Mode - No Backend).',
                    },
                });
            }, 800);
        });
    },
};

export default mockAuthService;
