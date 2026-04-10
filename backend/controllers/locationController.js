const locationModel = require('../models/locationModel');
const { success, error } = require('../utils/responseHelper');

// POST /api/location/update
const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, accuracy } = req.body;

        if (!latitude || !longitude) {
            return error(res, 'Latitude and longitude are required.', 400);
        }

        await locationModel.updateLocation(req.user.id, latitude, longitude, accuracy);
        return success(res, 'Location updated.', null, 201);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// GET /api/location/me
const getMyLocation = async (req, res) => {
    try {
        const location = await locationModel.getLatestLocation(req.user.id);
        return success(res, 'Location fetched.', location || null);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// GET /api/location/all (admin/manager)
const getAllLocations = async (req, res) => {
    try {
        const locations = await locationModel.getAllLatestLocations();
        return success(res, 'All locations fetched.', locations);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

// GET /api/location/history?hours=8
const getLocationHistory = async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 8;
        const history = await locationModel.getLocationHistory(req.user.id, hours);
        return success(res, 'Location history fetched.', history);
    } catch (err) {
        return error(res, 'Server error.', 500);
    }
};

module.exports = { updateLocation, getMyLocation, getAllLocations, getLocationHistory };
