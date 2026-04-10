const db = require('../config/db');

const applyLeave = async (data) => {
    const { employee_id, leave_type, from_date, to_date, total_days, reason } = data;
    const [result] = await db.query(
        `INSERT INTO leaves (employee_id, leave_type, from_date, to_date, total_days, reason)
     VALUES (?, ?, ?, ?, ?, ?)`,
        [employee_id, leave_type, from_date, to_date, total_days, reason]
    );
    return result;
};

const getLeavesByEmployee = async (employee_id) => {
    const [rows] = await db.query(
        `SELECT * FROM leaves WHERE employee_id = ? ORDER BY created_at DESC`,
        [employee_id]
    );
    return rows;
};

const getAllPendingLeaves = async () => {
    const [rows] = await db.query(
        `SELECT l.*, e.name AS employee_name, e.employee_id AS emp_code, e.designation
     FROM leaves l
     JOIN employees e ON l.employee_id = e.id
     WHERE l.status = 'pending'
     ORDER BY l.created_at ASC`
    );
    return rows;
};

const updateLeaveStatus = async (leave_id, status, approved_by, rejection_reason = null) => {
    const [result] = await db.query(
        `UPDATE leaves SET status=?, approved_by=?, approved_at=NOW(), rejection_reason=?, updated_at=NOW()
     WHERE id=?`,
        [status, approved_by, rejection_reason, leave_id]
    );
    return result;
};

const cancelLeave = async (leave_id, employee_id) => {
    const [result] = await db.query(
        `UPDATE leaves SET status='cancelled', updated_at=NOW()
     WHERE id=? AND employee_id=? AND status='pending'`,
        [leave_id, employee_id]
    );
    return result;
};

const getLeaveBalance = async (employee_id) => {
    const year = new Date().getFullYear();
    const [rows] = await db.query(
        `SELECT leave_type, SUM(total_days) AS used_days
     FROM leaves
     WHERE employee_id=? AND YEAR(from_date)=? AND status='approved'
     GROUP BY leave_type`,
        [employee_id, year]
    );
    return rows;
};

module.exports = { applyLeave, getLeavesByEmployee, getAllPendingLeaves, updateLeaveStatus, cancelLeave, getLeaveBalance };
