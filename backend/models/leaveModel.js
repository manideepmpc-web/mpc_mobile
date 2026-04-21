const db = require('../config/db');

const applyLeave = async (data) => {
    const { employee_id, leave_type, from_date, to_date, total_days, reason } = data;
    const result = await db.query(
        `INSERT INTO leaves (employee_id, leave_type, from_date, to_date, total_days, reason)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [employee_id, leave_type, from_date, to_date, total_days, reason]
    );
    return result.rows[0];
};

const getLeavesByEmployee = async (employee_id) => {
    const result = await db.query(
        `SELECT * FROM leaves WHERE employee_id = $1 ORDER BY created_at DESC`,
        [employee_id]
    );
    return result.rows;
};

const getAllPendingLeaves = async () => {
    const result = await db.query(
        `SELECT l.*, e.name AS employee_name, e.employee_id AS emp_code, e.designation
     FROM leaves l
     JOIN employees e ON l.employee_id = e.id
     WHERE l.status = 'pending'
     ORDER BY l.created_at ASC`
    );
    return result.rows;
};

const updateLeaveStatus = async (leave_id, status, approved_by, rejection_reason = null) => {
    const result = await db.query(
        `UPDATE leaves SET status=$1, approved_by=$2, approved_at=NOW(), rejection_reason=$3
     WHERE id=$4 RETURNING *`,
        [status, approved_by, rejection_reason, leave_id]
    );
    return result.rows[0];
};

const cancelLeave = async (leave_id, employee_id) => {
    const result = await db.query(
        `UPDATE leaves SET status='cancelled'
     WHERE id=$1 AND employee_id=$2 AND status='pending' RETURNING *`,
        [leave_id, employee_id]
    );
    return result.rows[0];
};

const getLeaveBalance = async (employee_id) => {
    const year = new Date().getFullYear();
    const result = await db.query(
        `SELECT leave_type, SUM(total_days) AS used_days
     FROM leaves
     WHERE employee_id=$1 AND EXTRACT(YEAR FROM from_date)=$2 AND status='approved'
     GROUP BY leave_type`,
        [employee_id, year]
    );
    return result.rows;
};

module.exports = { applyLeave, getLeavesByEmployee, getAllPendingLeaves, updateLeaveStatus, cancelLeave, getLeaveBalance };
