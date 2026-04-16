// Change this to your machine's local IP when testing on a physical device
// For mobile APK, use your computer's WiFi IP
// export const API_BASE_URL = 'http://localhost:5000/api'; // For web browser
export const API_BASE_URL = 'http://10.40.126.246:5000/api'; // For mobile APK

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
