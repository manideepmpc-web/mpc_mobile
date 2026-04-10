const employeeModel = require('../models/employeeModel');
const { success, error } = require('../utils/responseHelper');

// GET /api/employees
const getAllEmployees = async (req, res) => {
    try {
        const employees = await employeeModel.getAllEmployees();
        return success(res, 'Employees fetched.', employees);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// GET /api/employees/:id
const getEmployee = async (req, res) => {
    try {
        const employee = await employeeModel.findById(req.params.id);
        if (!employee) return error(res, 'Employee not found.', 404);
        const { password: _, ...data } = employee;
        return success(res, 'Employee fetched.', data);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res) => {
    try {
        const id = req.params.id;
        // Only admin or the employee themselves can update
        if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
            return error(res, 'Unauthorized to update this profile.', 403);
        }
        const result = await employeeModel.updateEmployee(id, req.body);
        if (result.affectedRows === 0) return error(res, 'Employee not found.', 404);
        const updated = await employeeModel.findById(id);
        const { password: _, ...data } = updated;
        return success(res, 'Profile updated successfully.', data);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

module.exports = { getAllEmployees, getEmployee, updateEmployee };
