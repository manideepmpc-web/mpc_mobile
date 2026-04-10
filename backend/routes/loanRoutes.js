const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { createLoan, getMyLoans, getLoanById, updateLoan, deleteLoan, addPayment, getPayments, getSummary } = require('../controllers/loanController');

// All routes require authentication
router.use(verifyToken);

router.get('/summary', getSummary);
router.get('/', getMyLoans);
router.post('/', createLoan);
router.get('/:id', getLoanById);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);
router.get('/:id/payments', getPayments);
router.post('/:id/payments', addPayment);

module.exports = router;
