// Change this to your machine's local IP when testing on a physical device
// For local testing on same PC, use localhost
// export const API_BASE_URL = 'http://10.220.86.246:5000/api'; // For mobile devices
// export const API_BASE_URL = 'http://localhost:5000/api'; // For local testing

// 🚀 PRODUCTION: Railway Backend URL
// export const API_BASE_URL = 'https://mpc-backend-production-59a0.up.railway.app/api'; // Railway Production URL

// 🏠 LOCAL: Backend running on localhost for emulator testing
export const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Local backend for Android emulator

// For mobile device testing (use your machine's IP if testing locally)
// export const API_BASE_URL = 'http://10.230.211.46:5000/api';

export const LEAVE_TYPES = [
    { label: 'Casual Leave', value: 'casual' },
    { label: 'Sick Leave', value: 'sick' },
    { label: 'Earned Leave', value: 'earned' },
    { label: 'Maternity Leave', value: 'maternity' },
    { label: 'Paternity Leave', value: 'paternity' },
    { label: 'Unpaid Leave', value: 'unpaid' },
];

export const LEAVE_QUOTA = {
    casual: 12,
    sick: 10,
    earned: 15,
    maternity: 180,
    paternity: 15,
    unpaid: 0,
};
