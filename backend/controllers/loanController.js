const loanModel = require('../models/loanModel');
const { success, error } = require('../utils/responseHelper');

const createLoan = async (req, res) => {
    try {
        const data = { ...req.body, created_by: req.user.id };
        if (!data.borrower_name || !data.type || !data.principal_amount || !data.start_date) {
            return error(res, 'borrower_name, type, principal_amount, and start_date are required.', 400);
        }
        const result = await loanModel.createLoan(data);
        return success(res, { id: result.insertId }, 'Loan created successfully.', 201);
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to create loan.');
    }
};

const getMyLoans = async (req, res) => {
    try {
        await loanModel.markOverdueLoans(req.user.id);
        const loans = await loanModel.getLoansByUser(req.user.id);
        return success(res, loans);
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to fetch loans.');
    }
};

const getLoanById = async (req, res) => {
    try {
        const loan = await loanModel.getLoanById(req.params.id, req.user.id);
        if (!loan) return error(res, 'Loan not found.', 404);
        return success(res, loan);
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to fetch loan.');
    }
};

const updateLoan = async (req, res) => {
    try {
        const result = await loanModel.updateLoan(req.params.id, req.user.id, req.body);
        if (result.affectedRows === 0) return error(res, 'Loan not found or unauthorized.', 404);
        return success(res, null, 'Loan updated successfully.');
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to update loan.');
    }
};

const deleteLoan = async (req, res) => {
    try {
        const result = await loanModel.deleteLoan(req.params.id, req.user.id);
        if (result.affectedRows === 0) return error(res, 'Loan not found or unauthorized.', 404);
        return success(res, null, 'Loan deleted.');
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to delete loan.');
    }
};

const addPayment = async (req, res) => {
    try {
        const { amount, payment_date, note } = req.body;
        if (!amount || !payment_date) return error(res, 'amount and payment_date are required.', 400);

        // Verify the loan belongs to this user
        const loan = await loanModel.getLoanById(req.params.id, req.user.id);
        if (!loan) return error(res, 'Loan not found or unauthorized.', 404);
        if (loan.remaining_amount <= 0) return error(res, 'Loan is already fully paid.', 400);

        await loanModel.addPayment(req.params.id, { amount, payment_date, note });

        // Auto-settle if remaining becomes <= 0
        const updatedLoan = await loanModel.getLoanById(req.params.id, req.user.id);
        if (updatedLoan.remaining_amount <= 0) {
            await loanModel.updateLoan(req.params.id, req.user.id, { ...updatedLoan, status: 'settled' });
        }
        return success(res, null, 'Payment recorded successfully.', 201);
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to record payment.');
    }
};

const getPayments = async (req, res) => {
    try {
        const loan = await loanModel.getLoanById(req.params.id, req.user.id);
        if (!loan) return error(res, 'Loan not found or unauthorized.', 404);
        const payments = await loanModel.getPaymentsByLoan(req.params.id);
        return success(res, payments);
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to fetch payments.');
    }
};

const getSummary = async (req, res) => {
    try {
        await loanModel.markOverdueLoans(req.user.id);
        const summary = await loanModel.getSummary(req.user.id);
        return success(res, summary);
    } catch (err) {
        console.error(err);
        return error(res, 'Failed to fetch summary.');
    }
};

module.exports = { createLoan, getMyLoans, getLoanById, updateLoan, deleteLoan, addPayment, getPayments, getSummary };
