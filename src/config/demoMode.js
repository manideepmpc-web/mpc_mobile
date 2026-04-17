// src/config/demoMode.js
// Demo mode configuration - switch between backend API and mock authentication

// 🎯 SET THIS TO TRUE FOR DEMO MODE (NO BACKEND NEEDED)
export const DEMO_MODE = true;

// ⚠️ When DEMO_MODE = true:
// - Login works with test credentials WITHOUT backend
// - No network calls required
// - Perfect for client demos and testing

// 🔧 When DEMO_MODE = false:
// - Uses real backend API
// - Requires backend running
// - Uses actual database

export const DEMO_CREDENTIALS = {
    email: 'test@mpc.com',
    password: 'mpc@123',
};

export default DEMO_MODE;
