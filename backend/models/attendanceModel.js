const db = require('../config/db');

const getTodayAttendance = async (employee_id) => {
    const [rows] = await db.query(
        `SELECT * FROM attendance WHERE employee_id = ? AND date = CURDATE()`,
        [employee_id]
    );
    return rows[0];
};

const checkIn = async (employee_id, location) => {
    const [result] = await db.query(
        `INSERT INTO attendance (employee_id, date, check_in, check_in_location, status)
     VALUES (?, CURDATE(), NOW(), ?, 'present')
     ON DUPLICATE KEY UPDATE check_in = IF(check_in IS NULL, NOW(), check_in), check_in_location = IF(check_in_location IS NULL, ?, check_in_location)`,
        [employee_id, location, location]
    );
    return result;
};

const checkOut = async (employee_id, location) => {
    const [result] = await db.query(
        `UPDATE attendance 
     SET check_out = NOW(), check_out_location = ?,
         work_hours = ROUND(TIMESTAMPDIFF(MINUTE, check_in, NOW()) / 60, 2)
     WHERE employee_id = ? AND date = CURDATE() AND check_in IS NOT NULL`,
        [location, employee_id]
    );
    return result;
};

const getAttendanceHistory = async (employee_id, limit = 30) => {
    const [rows] = await db.query(
        `SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC LIMIT ?`,
        [employee_id, limit]
    );
    return rows;
};

const getMonthlyStats = async (employee_id, year, month) => {
    const [rows] = await db.query(
        `SELECT 
       COUNT(*) AS total_days,
       SUM(CASE WHEN status='present' THEN 1 ELSE 0 END) AS present_days,
       SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) AS absent_days,
       SUM(CASE WHEN status='half_day' THEN 1 ELSE 0 END) AS half_days,
       ROUND(SUM(work_hours), 2) AS total_hours
     FROM attendance 
     WHERE employee_id = ? AND YEAR(date) = ? AND MONTH(date) = ?`,
        [employee_id, year, month]
    );
    return rows[0];
};

const getAllAttendanceToday = async () => {
    const [rows] = await db.query(
        `SELECT a.*, e.name, e.employee_id AS emp_code
     FROM attendance a
     JOIN employees e ON a.employee_id = e.id
     WHERE a.date = CURDATE()
     ORDER BY a.check_in DESC`
    );
    return rows;
};

module.exports = { getTodayAttendance, checkIn, checkOut, getAttendanceHistory, getMonthlyStats, getAllAttendanceToday };
