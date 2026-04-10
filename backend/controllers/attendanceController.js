const attendanceModel = require('../models/attendanceModel');
const { success, error } = require('../utils/responseHelper');

// POST /api/attendance/checkin
const checkIn = async (req, res) => {
    try {
        const employee_id = req.user.id;
        const { latitude, longitude } = req.body;

        const existing = await attendanceModel.getTodayAttendance(employee_id);
        if (existing && existing.check_in) {
            return error(res, 'You have already checked in today.', 400);
        }

        const location = latitude && longitude ? `${latitude},${longitude}` : null;
        await attendanceModel.checkIn(employee_id, location);

        const record = await attendanceModel.getTodayAttendance(employee_id);
        return success(res, 'Check-in successful!', record, 201);
    } catch (err) {
        console.error('Check-in error:', err);
        return error(res, 'Server error during check-in.', 500);
    }
};

// POST /api/attendance/checkout
const checkOut = async (req, res) => {
    try {
        const employee_id = req.user.id;
        const { latitude, longitude } = req.body;

        const existing = await attendanceModel.getTodayAttendance(employee_id);
        if (!existing || !existing.check_in) {
            return error(res, 'You have not checked in today.', 400);
        }
        if (existing.check_out) {
            return error(res, 'You have already checked out today.', 400);
        }

        const location = latitude && longitude ? `${latitude},${longitude}` : null;
        await attendanceModel.checkOut(employee_id, location);

        const record = await attendanceModel.getTodayAttendance(employee_id);
        return success(res, 'Check-out successful!', record);
    } catch (err) {
        return error(res, 'Server error during check-out.', 500);
    }
};

// GET /api/attendance/today
const getTodayStatus = async (req, res) => {
    try {
        const record = await attendanceModel.getTodayAttendance(req.user.id);
        return success(res, 'Today attendance fetched.', record || null);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// GET /api/attendance/history
const getHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 30;
        const records = await attendanceModel.getAttendanceHistory(req.user.id, limit);
        return success(res, 'Attendance history fetched.', records);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// GET /api/attendance/stats?year=2026&month=3
const getMonthlyStats = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        const month = req.query.month || (new Date().getMonth() + 1);
        const stats = await attendanceModel.getMonthlyStats(req.user.id, year, month);
        return success(res, 'Monthly stats fetched.', stats);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// GET /api/attendance/all-today (admin/manager)
const getAllTodayAttendance = async (req, res) => {
    try {
        const records = await attendanceModel.getAllAttendanceToday();
        return success(res, 'All today attendance fetched.', records);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

module.exports = { checkIn, checkOut, getTodayStatus, getHistory, getMonthlyStats, getAllTodayAttendance };
