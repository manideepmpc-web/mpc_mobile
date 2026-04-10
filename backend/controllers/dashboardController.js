const db = require('../config/db');
const { success, error } = require('../utils/responseHelper');

// GET /api/dashboard
const getDashboardStats = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin' || req.user.role === 'manager';

        if (isAdmin) {
            // Admin dashboard: overall stats
            const [empCount] = await db.query('SELECT COUNT(*) AS total FROM employees WHERE is_active=1');
            const [todayPresent] = await db.query(
                "SELECT COUNT(*) AS total FROM attendance WHERE date=CURDATE() AND status='present'"
            );
            const [pendingLeaves] = await db.query(
                "SELECT COUNT(*) AS total FROM leaves WHERE status='pending'"
            );
            const [deptCount] = await db.query('SELECT COUNT(*) AS total FROM departments');

            return success(res, 'Dashboard stats fetched.', {
                total_employees: empCount[0].total,
                present_today: todayPresent[0].total,
                pending_leaves: pendingLeaves[0].total,
                total_departments: deptCount[0].total,
            });
        } else {
            // Employee dashboard: personal stats
            const emp_id = req.user.id;
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;

            const [monthlyAtt] = await db.query(
                `SELECT 
           COUNT(*) AS attended,
           SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) AS present_days,
           ROUND(SUM(work_hours), 2) AS total_hours
         FROM attendance 
         WHERE employee_id=? AND YEAR(date)=? AND MONTH(date)=?`,
                [emp_id, year, month]
            );

            const [pendingLeaves] = await db.query(
                "SELECT COUNT(*) AS total FROM leaves WHERE employee_id=? AND status='pending'",
                [emp_id]
            );

            const [todayAtt] = await db.query(
                'SELECT * FROM attendance WHERE employee_id=? AND date=CURDATE()',
                [emp_id]
            );

            return success(res, 'Dashboard stats fetched.', {
                present_this_month: monthlyAtt[0].present_days || 0,
                total_hours_this_month: monthlyAtt[0].total_hours || 0,
                pending_leaves: pendingLeaves[0].total,
                today_attendance: todayAtt[0] || null,
            });
        }
    } catch (err) {
        console.error('Dashboard error:', err);
        return error(res, 'Server error.', 500);
    }
};

module.exports = { getDashboardStats };
