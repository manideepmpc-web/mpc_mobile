const express = require('express');
const router = express.Router();
const { login, register, getMe, verifyOTP } = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', verifyToken, getMe);
router.post('/verify-otp', verifyOTP);

module.exports = router;
