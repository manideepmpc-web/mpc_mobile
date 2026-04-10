const express = require('express');
const router = express.Router();
const {
    applyLeave, getMyLeaves, getLeaveBalance, getPendingLeaves, updateLeaveStatus, cancelLeave
} = require('../controllers/leaveController');
const { verifyToken, isManagerOrAdmin } = require('../middleware/authMiddleware');

router.post('/apply', verifyToken, applyLeave);
router.get('/my', verifyToken, getMyLeaves);
router.get('/balance', verifyToken, getLeaveBalance);
router.get('/pending', verifyToken, isManagerOrAdmin, getPendingLeaves);
router.put('/:id/status', verifyToken, isManagerOrAdmin, updateLeaveStatus);
router.put('/:id/cancel', verifyToken, cancelLeave);

module.exports = router;
