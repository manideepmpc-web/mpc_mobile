const db = require('../config/db');

// Create a new loan
const createLoan = async (data) => {
    const { created_by, borrower_name, borrower_contact, type, principal_amount, interest_rate, start_date, due_date, notes } = data;
    const result = await db.query(
        `INSERT INTO loans (created_by, borrower_name, borrower_contact, type, principal_amount, interest_rate, start_date, due_date, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [created_by, borrower_name, borrower_contact, type, principal_amount, interest_rate || 0, start_date, due_date || null, notes || null]
    );
    return result.rows[0];
};

// Get all loans for a user (with paid amount & remaining computed)
const getLoansByUser = async (userId) => {
    const result = await db.query(
        `SELECT l.*,
                COALESCE(SUM(p.amount), 0) AS paid_amount,
                (l.principal_amount - COALESCE(SUM(p.amount), 0)) AS remaining_amount
         FROM loans l
         LEFT JOIN loan_payments p ON p.loan_id = l.id
         WHERE l.created_by = $1
         GROUP BY l.id
         ORDER BY l.created_at DESC`,
        [userId]
    );
    return result.rows;
};

// Get single loan by id (with paid/remaining)
const getLoanById = async (loanId, userId) => {
    const result = await db.query(
        `SELECT l.*,
                COALESCE(SUM(p.amount), 0) AS paid_amount,
                (l.principal_amount - COALESCE(SUM(p.amount), 0)) AS remaining_amount
         FROM loans l
         LEFT JOIN loan_payments p ON p.loan_id = l.id
         WHERE l.id = $1 AND l.created_by = $2
         GROUP BY l.id`,
        [loanId, userId]
    );
    return result.rows[0];
};

// Update loan
const updateLoan = async (loanId, userId, data) => {
    const { borrower_name, borrower_contact, interest_rate, due_date, notes, status } = data;
    const result = await db.query(
        `UPDATE loans SET borrower_name=$1, borrower_contact=$2, interest_rate=$3, due_date=$4, notes=$5, status=$6
         WHERE id=$7 AND created_by=$8 RETURNING *`,
        [borrower_name, borrower_contact, interest_rate, due_date || null, notes || null, status, loanId, userId]
    );
    return result.rows[0];
};

// Delete loan
const deleteLoan = async (loanId, userId) => {
    const result = await db.query('DELETE FROM loans WHERE id=$1 AND created_by=$2 RETURNING *', [loanId, userId]);
    return result.rows[0];
};

// Add payment
const addPayment = async (loanId, data) => {
    const { amount, payment_date, note } = data;
    const result = await db.query(
        `INSERT INTO loan_payments (loan_id, amount, payment_date, note) VALUES ($1, $2, $3, $4) RETURNING *`,
        [loanId, amount, payment_date, note || null]
    );
    return result.rows[0];
};

// Get payments for a loan
const getPaymentsByLoan = async (loanId) => {
    const result = await db.query(
        `SELECT * FROM loan_payments WHERE loan_id = $1 ORDER BY payment_date DESC`,
        [loanId]
    );
    return result.rows;
};

// Summary for user
const getSummary = async (userId) => {
    const result = await db.query(
        `SELECT
            COUNT(*) AS total_loans,
            SUM(CASE WHEN type='given' THEN principal_amount ELSE 0 END) AS total_given,
            SUM(CASE WHEN type='taken' THEN principal_amount ELSE 0 END) AS total_taken,
            SUM(CASE WHEN type='given' THEN (principal_amount - COALESCE(paid,0)) ELSE 0 END) AS pending_receivable,
            SUM(CASE WHEN type='taken' THEN (principal_amount - COALESCE(paid,0)) ELSE 0 END) AS pending_payable,
            SUM(CASE WHEN status='overdue' THEN 1 ELSE 0 END) AS overdue_count
         FROM (
             SELECT l.id, l.type, l.principal_amount, l.status, COALESCE(SUM(p.amount),0) AS paid
             FROM loans l
             LEFT JOIN loan_payments p ON p.loan_id = l.id
             WHERE l.created_by = $1
             GROUP BY l.id
         ) sub`,
        [userId]
    );
    return result.rows[0];
};

// Auto-mark overdue loans (due_date < today and not settled)
const markOverdueLoans = async (userId) => {
    await db.query(
        `UPDATE loans SET status='overdue' WHERE created_by=$1 AND due_date < CURRENT_DATE AND status='active'`,
        [userId]
    );
};

module.exports = { createLoan, getLoansByUser, getLoanById, updateLoan, deleteLoan, addPayment, getPaymentsByLoan, getSummary, markOverdueLoans };
