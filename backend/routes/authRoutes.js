const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', verifyToken, isAdmin, register);
router.get('/me', verifyToken, getMe);

module.exports = router;
