// This file is now DEPRECATED - loanService has been moved to index.js
// to support both online and offline modes
// 
// OLD: Direct API calls preserved for reference
// import api from './api';
// 
// export const loanService = {
//     getSummary: () => api.get('/loans/summary'),
//     getLoans: () => api.get('/loans'),
//     getLoan: (id) => api.get(`/loans/${id}`),
//     createLoan: (data) => api.post('/loans', data),
//     updateLoan: (id, data) => api.put(`/loans/${id}`, data),
//     deleteLoan: (id) => api.delete(`/loans/${id}`),
//     getPayments: (loanId) => api.get(`/loans/${loanId}/payments`),
//     addPayment: (loanId, data) => api.post(`/loans/${loanId}/payments`, data),
// };

// Re-export from index.js to maintain backward compatibility
export { loanService } from './index.js';
