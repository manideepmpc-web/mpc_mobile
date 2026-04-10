const leaveModel = require('../models/leaveModel');
const { success, error } = require('../utils/responseHelper');

// POST /api/leaves/apply
const applyLeave = async (req, res) => {
    try {
        const employee_id = req.user.id;
        const { leave_type, from_date, to_date, reason } = req.body;

        if (!leave_type || !from_date || !to_date) {
            return error(res, 'Leave type, from date, and to date are required.', 400);
        }

        const from = new Date(from_date);
        const to = new Date(to_date);
        if (to < from) return error(res, 'To date cannot be before from date.', 400);

        const total_days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

        await leaveModel.applyLeave({ employee_id, leave_type, from_date, to_date, total_days, reason });
        return success(res, 'Leave applied successfully. Pending approval.', null, 201);
    } catch (err) {
        console.error('Apply leave error:', err);
        return error(res, 'Server error.', 500);
    }
};

// GET /api/leaves/my
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await leaveModel.getLeavesByEmployee(req.user.id);
        return success(res, 'Leave records fetched.', leaves);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// GET /api/leaves/balance
const getLeaveBalance = async (req, res) => {
    try {
        const balance = await leaveModel.getLeaveBalance(req.user.id);
        return success(res, 'Leave balance fetched.', balance);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// GET /api/leaves/pending (admin/manager)
const getPendingLeaves = async (req, res) => {
    try {
        const leaves = await leaveModel.getAllPendingLeaves();
        return success(res, 'Pending leaves fetched.', leaves);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// PUT /api/leaves/:id/status (admin/manager)
const updateLeaveStatus = async (req, res) => {
    try {
        const { status, rejection_reason } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return error(res, 'Status must be approved or rejected.', 400);
        }
        await leaveModel.updateLeaveStatus(req.params.id, status, req.user.id, rejection_reason);
        return success(res, `Leave ${status} successfully.`);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// PUT /api/leaves/:id/cancel
const cancelLeave = async (req, res) => {
    try {
        const result = await leaveModel.cancelLeave(req.params.id, req.user.id);
        if (result.affectedRows === 0) return error(res, 'Leave not found or not cancellable.', 404);
        return success(res, 'Leave cancelled successfully.');
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

module.exports = { applyLeave, getMyLeaves, getLeaveBalance, getPendingLeaves, updateLeaveStatus, cancelLeave };
