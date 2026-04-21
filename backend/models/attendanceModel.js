const db = require('../config/db');

const getTodayAttendance = async (employee_id) => {
    const result = await db.query(
        `SELECT * FROM attendance WHERE employee_id = $1 AND date = CURRENT_DATE`,
        [employee_id]
    );
    return result.rows[0];
};

const checkIn = async (employee_id, location) => {
    const result = await db.query(
        `INSERT INTO attendance (employee_id, date, check_in, check_in_location, status)
     VALUES ($1, CURRENT_DATE, NOW(), $2, 'present')
     ON CONFLICT (employee_id, date) DO UPDATE SET 
       check_in = CASE WHEN attendance.check_in IS NULL THEN NOW() ELSE attendance.check_in END,
       check_in_location = CASE WHEN attendance.check_in_location IS NULL THEN $2 ELSE attendance.check_in_location END
     RETURNING *`,
        [employee_id, location]
    );
    return result.rows[0];
};

const checkOut = async (employee_id, location) => {
    const result = await db.query(
        `UPDATE attendance 
     SET check_out = NOW(), check_out_location = $1,
         work_hours = ROUND(EXTRACT(EPOCH FROM (NOW() - check_in)) / 3600.0, 2)
     WHERE employee_id = $2 AND date = CURRENT_DATE AND check_in IS NOT NULL RETURNING *`,
        [location, employee_id]
    );
    return result.rows[0];
};

const getAttendanceHistory = async (employee_id, limit = 30) => {
    const result = await db.query(
        `SELECT * FROM attendance WHERE employee_id = $1 ORDER BY date DESC LIMIT $2`,
        [employee_id, limit]
    );
    return result.rows;
};

const getMonthlyStats = async (employee_id, year, month) => {
    const result = await db.query(
        `SELECT 
       COUNT(*) AS total_days,
       SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) AS present_days,
       SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) AS absent_days,
       SUM(CASE WHEN status='half_day' THEN 1 ELSE 0 END) AS half_days,
       ROUND(SUM(work_hours), 2) AS total_hours
     FROM attendance 
     WHERE employee_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3`,
        [employee_id, year, month]
    );
    return result.rows[0];
};

const getAllAttendanceToday = async () => {
    const result = await db.query(
        `SELECT a.*, e.name, e.employee_id AS emp_code
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     WHERE a.date = CURRENT_DATE
     ORDER BY a.check_in DESC`
    );
    return result.rows;
};

module.exports = { getTodayAttendance, checkIn, checkOut, getAttendanceHistory, getMonthlyStats, getAllAttendanceToday };
