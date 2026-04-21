const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const employeeModel = require('../models/employeeModel');
const { success, error } = require('../utils/responseHelper');
const sendOTPEmail = require('../utils/sendEmail');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return error(res, 'Email and password are required.', 400);
        }

        // Dummy credentials check - skip validation for these
        // Test credentials
        if (email === 'test@mpc.com' && password === 'mpc@123') {
            const token = jwt.sign(
                { id: 1, email: 'test@mpc.com', role: 'admin', name: 'Test User' },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            const dummyEmployee = {
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
                is_active: 1
            };

            return success(res, { token, employee: dummyEmployee }, 'Login successful.');
        }

        // Original demo credentials
        if (email === 'mpc_hyd@moneytracker.com' && password === 'mpc_hyd@1') {
            const token = jwt.sign(
                { id: 0, email: 'mpc_hyd@moneytracker.com', role: 'admin', name: 'Money Tracker Admin' },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            const dummyEmployee = {
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
                is_active: 1
            };

            return success(res, { token, employee: dummyEmployee }, 'Login successful.');
        }

        const employee = await employeeModel.findByEmail(email);
        if (!employee) {
            return error(res, 'Invalid email or password.', 401);
        }

        if (!employee.is_active) {
            return error(res, 'Your account is deactivated. Contact HR.', 403);
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return error(res, 'Invalid email or password.', 401);
        }

        const token = jwt.sign(
            { id: employee.id, email: employee.email, role: employee.role, name: employee.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const { password: _, ...employeeData } = employee;
        return success(res, { token, employee: employeeData }, 'Login successful.');
    } catch (err) {
        console.error('Login error:', err);
        return error(res, 'Server error during login.', 500);
    }
};

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, phone, department_id, designation, role, date_of_joining, gender, date_of_birth, address } = req.body;

        if (!name || !email || !password) {
            return error(res, 'Name, email, and password are required.', 400);
        }

        const existing = await employeeModel.findByEmail(email);
        if (existing) {
            return error(res, 'Employee with this email already exists.', 409);
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const employee_id = await employeeModel.generateEmployeeId();

        await employeeModel.createEmployee({
            employee_id, name, email, password: hashedPassword,
            phone, department_id, designation, role: role || 'employee',
            date_of_joining, gender, date_of_birth, address
        });

        // Generate and send OTP for verification
        let otp_code;
        if (process.env.NODE_ENV === 'production' || process.env.USE_REAL_OTP === 'true') {
            otp_code = generateOTP();
            await sendOTPEmail(email, otp_code);
        } else {
            // 🎯 DUMMY OTP FOR TESTING: Use 8888
            otp_code = '8888';
            console.log('🔓 Using dummy OTP 8888 for testing - Email:', email);
            // Skip email sending in test mode
        }
        await employeeModel.saveOTP(email, otp_code);

        return success(res, { employee_id, otp_sent: true }, `Employee registered successfully. ID: ${employee_id}. OTP sent to email.`, 201);
    } catch (err) {
        console.error('Register error:', err);
        return error(res, 'Server error during registration.', 500);
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const employee = await employeeModel.findById(req.user.id);
        if (!employee) return error(res, 'Employee not found.', 404);
        const { password: _, ...employeeData } = employee;
        return success(res, employeeData, 'Profile fetched.');
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
    try {
        const { email, otp_code } = req.body;

        if (!email || !otp_code) {
            return error(res, 'Email and OTP are required.', 400);
        }

        // 🎯 DUMMY OTP FOR TESTING: Always accept "8888"
        if (otp_code === '8888') {
            console.log('🔓 Using dummy OTP 8888 for testing');
            // Clear OTP after successful verification
            await employeeModel.saveOTP(email, null);
            return success(res, {}, 'OTP verified ✅ (Dummy Mode)');
        }

        const user = await employeeModel.verifyOTP(email, otp_code);

        if (user) {
            // Clear OTP after successful verification
            await employeeModel.saveOTP(email, null);
            return success(res, {}, 'OTP verified ✅');
        } else {
            return error(res, 'Invalid or expired OTP ❌', 400);
        }
    } catch (err) {
        console.error('OTP verification error:', err);
        return error(res, 'Server error during OTP verification.', 500);
    }
};

module.exports = { login, register, getMe, verifyOTP };

