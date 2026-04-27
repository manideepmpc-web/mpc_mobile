import api from './api';
import { APP_MODE, isOnlineMode, isOfflineMode } from '../config/appMode';
import offlineAuthService from './offlineAuthService';
import offlineEmployeeService from './offlineEmployeeService';
import offlineAttendanceService from './offlineAttendanceService';
import offlineLeaveService from './offlineLeaveService';
import offlineLoanService from './offlineLoanService';

// OLD: Original online services preserved
// const authService = {
//     login: (email, password) => api.post('/auth/login', { email, password }),
//     register: (data) => api.post('/auth/register', data),
//     verifyOTP: (email, otp_code) => api.post('/auth/verify-otp', { email, otp_code }),
//     getMe: () => api.get('/auth/me'),
// };

export const authService = {
    // OLD: return api.post('/auth/login', { email, password });
    login: (email, password) => {
        if (isOnlineMode()) {
            return api.post('/auth/login', { email, password });
        } else {
            return offlineAuthService.login(email, password);
        }
    },
    
    // OLD: return api.post('/auth/register', data);
    register: (data) => {
        if (isOnlineMode()) {
            return api.post('/auth/register', data);
        } else {
            return offlineAuthService.register(data);
        }
    },
    
    // OLD: return api.post('/auth/verify-otp', { email, otp_code });
    verifyOTP: (email, otp_code) => {
        if (isOnlineMode()) {
            return api.post('/auth/verify-otp', { email, otp_code });
        } else {
            return offlineAuthService.verifyOTP(email, otp_code);
        }
    },
    
    // OLD: return api.get('/auth/me');
    getMe: () => {
        if (isOnlineMode()) {
            return api.get('/auth/me');
        } else {
            return offlineAuthService.getMe();
        }
    },
    
    // Additional offline methods
    logout: () => {
        if (isOnlineMode()) {
            // Online logout would be handled by token invalidation on backend
            // For now, we'll use offline logout for both modes
            return offlineAuthService.logout();
        } else {
            return offlineAuthService.logout();
        }
    },
    
    isLoggedIn: () => {
        return offlineAuthService.isLoggedIn();
    },
    
    getToken: () => {
        return offlineAuthService.getToken();
    },
};

export const employeeService = {
    // OLD: return api.get('/employees');
    getAll: () => {
        if (isOnlineMode()) {
            return api.get('/employees');
        } else {
            return offlineEmployeeService.getAll();
        }
    },
    
    // OLD: return api.get(`/employees/${id}`);
    getById: (id) => {
        if (isOnlineMode()) {
            return api.get(`/employees/${id}`);
        } else {
            return offlineEmployeeService.getById(id);
        }
    },
    
    // OLD: return api.put(`/employees/${id}`, data);
    update: (id, data) => {
        if (isOnlineMode()) {
            return api.put(`/employees/${id}`, data);
        } else {
            return offlineEmployeeService.update(id, data);
        }
    },
    
    // OLD: return api.post('/auth/register', data);
    create: (data) => {
        if (isOnlineMode()) {
            return api.post('/auth/register', data);
        } else {
            return offlineEmployeeService.create(data);
        }
    },
    
    // Additional offline methods
    delete: (id) => {
        if (isOnlineMode()) {
            // Online delete endpoint (if exists)
            return api.delete(`/employees/${id}`);
        } else {
            return offlineEmployeeService.delete(id);
        }
    },
    
    search: (query) => {
        if (isOnlineMode()) {
            // Online search endpoint (if exists)
            return api.get(`/employees/search?q=${query}`);
        } else {
            return offlineEmployeeService.search(query);
        }
    },
};

export const attendanceService = {
    // OLD: return api.post('/attendance/checkin', { location });
    checkIn: (location) => {
        if (isOnlineMode()) {
            return api.post('/attendance/checkin', { location });
        } else {
            return offlineAttendanceService.checkIn(location);
        }
    },
    
    // OLD: return api.post('/attendance/checkout', { location });
    checkOut: (location) => {
        if (isOnlineMode()) {
            return api.post('/attendance/checkout', { location });
        } else {
            return offlineAttendanceService.checkOut(location);
        }
    },
    
    // alias for screens
    // OLD: return api.get('/attendance/today');
    getTodayStatus: () => {
        if (isOnlineMode()) {
            return api.get('/attendance/today');
        } else {
            return offlineAttendanceService.getTodayStatus();
        }
    },
    
    // OLD: return api.get('/attendance/today');
    getToday: () => {
        if (isOnlineMode()) {
            return api.get('/attendance/today');
        } else {
            return offlineAttendanceService.getTodayStatus();
        }
    },
    
    // OLD: return api.get(`/attendance/history?limit=${limit}`);
    getHistory: (limit = 30) => {
        if (isOnlineMode()) {
            return api.get(`/attendance/history?limit=${limit}`);
        } else {
            return offlineAttendanceService.getHistory(limit);
        }
    },
    
    // OLD: return api.get(`/attendance/stats?year=${year}&month=${month}`);
    getStats: (year, month) => {
        if (isOnlineMode()) {
            return api.get(`/attendance/stats?year=${year}&month=${month}`);
        } else {
            return offlineAttendanceService.getStats(year, month);
        }
    },
    
    // OLD: return api.get('/attendance/all-today');
    getAllToday: () => {
        if (isOnlineMode()) {
            return api.get('/attendance/all-today');
        } else {
            return offlineAttendanceService.getAllToday();
        }
    },
    
    // Additional offline methods
    markAttendance: (employee_id, date, status, notes) => {
        if (isOnlineMode()) {
            // Online mark attendance endpoint (if exists)
            return api.post('/attendance/mark', { employee_id, date, status, notes });
        } else {
            return offlineAttendanceService.markAttendance(employee_id, date, status, notes);
        }
    },
};

export const leaveService = {
    // OLD: return api.post('/leaves/apply', data);
    apply: (data) => {
        if (isOnlineMode()) {
            return api.post('/leaves/apply', data);
        } else {
            return offlineLeaveService.apply(data);
        }
    },
    
    // alias for screens
    // OLD: return api.get('/leaves/my');
    getMyLeaves: () => {
        if (isOnlineMode()) {
            return api.get('/leaves/my');
        } else {
            return offlineLeaveService.getMyLeaves();
        }
    },
    
    // OLD: return api.get('/leaves/my');
    getMy: () => {
        if (isOnlineMode()) {
            return api.get('/leaves/my');
        } else {
            return offlineLeaveService.getMyLeaves();
        }
    },
    
    // OLD: return api.get('/leaves/balance');
    getBalance: () => {
        if (isOnlineMode()) {
            return api.get('/leaves/balance');
        } else {
            return offlineLeaveService.getBalance();
        }
    },
    
    // OLD: return api.get('/leaves/pending');
    getPending: () => {
        if (isOnlineMode()) {
            return api.get('/leaves/pending');
        } else {
            return offlineLeaveService.getPending();
        }
    },
    
    // OLD: return api.put(`/leaves/${id}/status`, { status, rejection_reason });
    updateStatus: (id, status, rejection_reason) => {
        if (isOnlineMode()) {
            return api.put(`/leaves/${id}/status`, { status, rejection_reason });
        } else {
            return offlineLeaveService.updateStatus(id, status, rejection_reason);
        }
    },
    
    // OLD: return api.put(`/leaves/${id}/cancel`);
    cancel: (id) => {
        if (isOnlineMode()) {
            return api.put(`/leaves/${id}/cancel`);
        } else {
            return offlineLeaveService.cancel(id);
        }
    },
    
    // Additional offline methods
    getById: (id) => {
        if (isOnlineMode()) {
            return api.get(`/leaves/${id}`);
        } else {
            return offlineLeaveService.getById(id);
        }
    },
    
    getAll: (filters) => {
        if (isOnlineMode()) {
            // Online get all leaves with filters
            const params = new URLSearchParams(filters).toString();
            return api.get(`/leaves?${params}`);
        } else {
            return offlineLeaveService.getAll(filters);
        }
    },
};

export const locationService = {
    // OLD: return api.post('/location/update', { latitude, longitude, accuracy });
    update: (latitude, longitude, accuracy) => {
        if (isOnlineMode()) {
            return api.post('/location/update', { latitude, longitude, accuracy });
        } else {
            // Offline location service would store locally
            // For now, return a mock response
            return Promise.resolve({
                data: {
                    success: true,
                    message: 'Location updated (Offline Mode)',
                },
            });
        }
    },
    
    // OLD: return api.get('/location/me');
    getMe: () => {
        if (isOnlineMode()) {
            return api.get('/location/me');
        } else {
            // Offline location retrieval from local storage
            return Promise.resolve({
                data: {
                    success: true,
                    data: null, // No location stored offline
                },
            });
        }
    },
    
    // OLD: return api.get('/location/all');
    getAll: () => {
        if (isOnlineMode()) {
            return api.get('/location/all');
        } else {
            return Promise.resolve({
                data: {
                    success: true,
                    data: [], // No locations stored offline
                },
            });
        }
    },
    
    // OLD: return api.get(`/location/history?hours=${hours}`);
    getHistory: (hours = 8) => {
        if (isOnlineMode()) {
            return api.get(`/location/history?hours=${hours}`);
        } else {
            return Promise.resolve({
                data: {
                    success: true,
                    data: [], // No location history offline
                },
            });
        }
    },
};

export const dashboardService = {
    // OLD: return api.get('/dashboard');
    getStats: () => {
        if (isOnlineMode()) {
            return api.get('/dashboard');
        } else {
            // Offline dashboard stats from local data
            return Promise.resolve({
                data: {
                    success: true,
                    data: {
                        totalEmployees: 2, // From seed data
                        presentToday: 0,
                        leavesPending: 0,
                        activeLoans: 0,
                    },
                },
            });
        }
    },
};

// Export loan service (merge with existing loanService.js)
export const loanService = {
    // From existing loanService.js - OLD: return api.get('/loans/summary');
    getSummary: () => {
        if (isOnlineMode()) {
            return api.get('/loans/summary');
        } else {
            return offlineLoanService.getSummary();
        }
    },
    
    // OLD: return api.get('/loans');
    getLoans: () => {
        if (isOnlineMode()) {
            return api.get('/loans');
        } else {
            return offlineLoanService.getLoans();
        }
    },
    
    // OLD: return api.get(`/loans/${id}`);
    getLoan: (id) => {
        if (isOnlineMode()) {
            return api.get(`/loans/${id}`);
        } else {
            return offlineLoanService.getLoan(id);
        }
    },
    
    // OLD: return api.post('/loans', data);
    createLoan: (data) => {
        if (isOnlineMode()) {
            return api.post('/loans', data);
        } else {
            return offlineLoanService.createLoan(data);
        }
    },
    
    // OLD: return api.put(`/loans/${id}`, data);
    updateLoan: (id, data) => {
        if (isOnlineMode()) {
            return api.put(`/loans/${id}`, data);
        } else {
            return offlineLoanService.updateLoan(id, data);
        }
    },
    
    // OLD: return api.delete(`/loans/${id}`);
    deleteLoan: (id) => {
        if (isOnlineMode()) {
            return api.delete(`/loans/${id}`);
        } else {
            return offlineLoanService.deleteLoan(id);
        }
    },
    
    // OLD: return api.get(`/loans/${loanId}/payments`);
    getPayments: (loanId) => {
        if (isOnlineMode()) {
            return api.get(`/loans/${loanId}/payments`);
        } else {
            return offlineLoanService.getPayments(loanId);
        }
    },
    
    // OLD: return api.post(`/loans/${loanId}/payments`, data);
    addPayment: (loanId, data) => {
        if (isOnlineMode()) {
            return api.post(`/loans/${loanId}/payments`, data);
        } else {
            return offlineLoanService.addPayment(loanId, data);
        }
    },
};
