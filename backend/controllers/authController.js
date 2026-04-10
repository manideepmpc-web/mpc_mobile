const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const employeeModel = require('../models/employeeModel');
const { success, error } = require('../utils/responseHelper');

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return error(res, 'Email and password are required.', 400);
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

// POST /api/auth/register (admin only)
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

        return success(res, { employee_id }, `Employee registered successfully. ID: ${employee_id}`, 201);
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

module.exports = { login, register, getMe };
