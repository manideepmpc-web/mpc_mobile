// Change this to your machine's local IP when testing on a physical device
// e.g., http://192.168.1.100:5000/api
// export const API_BASE_URL = 'http://localhost:5000/api';
export const API_BASE_URL = 'http://10.220.86.246:5000/api';

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
