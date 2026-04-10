const express = require('express');
const router = express.Router();
const { getAllEmployees, getEmployee, updateEmployee } = require('../controllers/employeeController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, isAdmin, getAllEmployees);
router.get('/:id', verifyToken, getEmployee);
router.put('/:id', verifyToken, updateEmployee);

module.exports = router;
