const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp();

// Import routes from the backend
const authRoutes = require('../backend/routes/authRoutes');
const employeeRoutes = require('../backend/routes/employeeRoutes');
const attendanceRoutes = require('../backend/routes/attendanceRoutes');
const leaveRoutes = require('../backend/routes/leaveRoutes');
const locationRoutes = require('../backend/routes/locationRoutes');
const dashboardRoutes = require('../backend/routes/dashboardRoutes');
const loanRoutes = require('../backend/routes/loanRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 MPC HRMS API (Cloud Functions) is running!', 
        version: '1.0.0', 
        timestamp: new Date(),
        env: 'Firebase Cloud Functions'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/loans', loanRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal server error.' });
});

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);

// Optional: Additional Cloud Functions can be added below
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send('Hello from MPC HRMS Cloud Functions!');
});
