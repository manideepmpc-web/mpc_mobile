const express = require('express');
const router = express.Router();
const { updateLocation, getMyLocation, getAllLocations, getLocationHistory } = require('../controllers/locationController');
const { verifyToken, isManagerOrAdmin } = require('../middleware/authMiddleware');

router.post('/update', verifyToken, updateLocation);
router.get('/me', verifyToken, getMyLocation);
router.get('/history', verifyToken, getLocationHistory);
router.get('/all', verifyToken, isManagerOrAdmin, getAllLocations);

module.exports = router;
