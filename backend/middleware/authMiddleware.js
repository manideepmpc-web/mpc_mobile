const jwt = require('jsonwebtoken');
const { error } = require('../utils/responseHelper');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return error(res, 'Access denied. No token provided.', 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, email, role }
        next();
    } catch (err) {
        return error(res, 'Invalid or expired token.', 403);
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return error(res, 'Admin access required.', 403);
};

const isManagerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
        return next();
    }
    return error(res, 'Manager or Admin access required.', 403);
};

module.exports = { verifyToken, isAdmin, isManagerOrAdmin };
