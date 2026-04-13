import api from './api';

export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    verifyOTP: (email, otp_code) => api.post('/auth/verify-otp', { email, otp_code }),
    getMe: () => api.get('/auth/me'),
};

export const employeeService = {
    getAll: () => api.get('/employees'),
    getById: (id) => api.get(`/employees/${id}`),
    update: (id, data) => api.put(`/employees/${id}`, data),
    create: (data) => api.post('/auth/register', data),
};

export const attendanceService = {
    checkIn: (location) => api.post('/attendance/checkin', { location }),
    checkOut: (location) => api.post('/attendance/checkout', { location }),
    // alias for screens
    getTodayStatus: () => api.get('/attendance/today'),
    getToday: () => api.get('/attendance/today'),
    getHistory: (limit = 30) => api.get(`/attendance/history?limit=${limit}`),
    getStats: (year, month) => api.get(`/attendance/stats?year=${year}&month=${month}`),
    getAllToday: () => api.get('/attendance/all-today'),
};

export const leaveService = {
    apply: (data) => api.post('/leaves/apply', data),
    // alias for screens
    getMyLeaves: () => api.get('/leaves/my'),
    getMy: () => api.get('/leaves/my'),
    getBalance: () => api.get('/leaves/balance'),
    getPending: () => api.get('/leaves/pending'),
    updateStatus: (id, status, rejection_reason) => api.put(`/leaves/${id}/status`, { status, rejection_reason }),
    cancel: (id) => api.put(`/leaves/${id}/cancel`),
};

export const locationService = {
    update: (latitude, longitude, accuracy) => api.post('/location/update', { latitude, longitude, accuracy }),
    getMe: () => api.get('/location/me'),
    getAll: () => api.get('/location/all'),
    getHistory: (hours = 8) => api.get(`/location/history?hours=${hours}`),
};

export const dashboardService = {
    getStats: () => api.get('/dashboard'),
};
