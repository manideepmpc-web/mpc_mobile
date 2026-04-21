const db = require('../config/db');

const findByEmail = async (email) => {
    const result = await db.query('SELECT * FROM employees WHERE email = $1', [email]);
    return result.rows[0];
};

const findById = async (id) => {
    const result = await db.query(
        `SELECT e.*, d.name AS department_name
     FROM employees e
     LEFT JOIN departments d ON e.department_id = d.id
     WHERE e.id = $1`,
        [id]
    );
    return result.rows[0];
};

const getAllEmployees = async () => {
    const result = await db.query(
        `SELECT e.id, e.employee_id, e.name, e.email, e.phone, e.designation, e.role,
            e.date_of_joining, e.is_active, e.profile_photo, d.name AS department_name
     FROM employees e
     LEFT JOIN departments d ON e.department_id = d.id
     ORDER BY e.name ASC`
    );
    return result.rows;
};

const createEmployee = async (data) => {
    const { employee_id, name, email, password, phone, department_id, designation, role, date_of_joining, gender, date_of_birth, address } = data;
    const result = await db.query(
        `INSERT INTO employees (employee_id, name, email, password, phone, department_id, designation, role, date_of_joining, gender, date_of_birth, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [employee_id, name, email, password, phone, department_id, designation, role, date_of_joining, gender, date_of_birth, address]
    );
    return result.rows[0];
};

const updateEmployee = async (id, data) => {
    const { name, phone, department_id, designation, address, date_of_birth, gender, profile_photo } = data;
    const result = await db.query(
        `UPDATE employees SET name=$1, phone=$2, department_id=$3, designation=$4, address=$5, date_of_birth=$6, gender=$7, profile_photo=$8
     WHERE id=$9 RETURNING *`,
        [name, phone, department_id, designation, address, date_of_birth, gender, profile_photo, id]
    );
    return result.rows[0];
};

const generateEmployeeId = async () => {
    const result = await db.query('SELECT COUNT(*) AS count FROM employees');
    const count = parseInt(result.rows[0].count) + 1;
    return `EMP${String(count).padStart(3, '0')}`;
};

const saveOTP = async (email, otp_code) => {
    if (otp_code === null) {
        const result = await db.query(
            'UPDATE employees SET otp_code = NULL, otp_expiry = NULL WHERE email = $1 RETURNING *',
            [email]
        );
        return result.rows[0];
    }
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    const result = await db.query(
        'UPDATE employees SET otp_code = $1, otp_expiry = $2 WHERE email = $3 RETURNING *',
        [otp_code, expiry, email]
    );
    return result.rows[0];
};

const verifyOTP = async (email, otp_code) => {
    const result = await db.query(
        'SELECT * FROM employees WHERE email = $1 AND otp_code = $2 AND otp_expiry > NOW()',
        [email, otp_code]
    );
    return result.rows[0];
};

module.exports = { findByEmail, findById, getAllEmployees, createEmployee, updateEmployee, generateEmployeeId, saveOTP, verifyOTP };
