const express = require('express');
const router = express.Router();
const {
    checkIn, checkOut, getTodayStatus, getHistory, getMonthlyStats, getAllTodayAttendance
} = require('../controllers/attendanceController');
const { verifyToken, isManagerOrAdmin } = require('../middleware/authMiddleware');

router.post('/checkin', verifyToken, checkIn);
router.post('/checkout', verifyToken, checkOut);
router.get('/today', verifyToken, getTodayStatus);
router.get('/history', verifyToken, getHistory);
router.get('/stats', verifyToken, getMonthlyStats);
router.get('/all-today', verifyToken, isManagerOrAdmin, getAllTodayAttendance);

module.exports = router;
