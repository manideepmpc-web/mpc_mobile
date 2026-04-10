const db = require('../config/db');

const findByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM employees WHERE email = ?', [email]);
    return rows[0];
};

const findById = async (id) => {
    const [rows] = await db.query(
        `SELECT e.*, d.name AS department_name 
     FROM employees e 
     LEFT JOIN departments d ON e.department_id = d.id 
     WHERE e.id = ?`,
        [id]
    );
    return rows[0];
};

const getAllEmployees = async () => {
    const [rows] = await db.query(
        `SELECT e.id, e.employee_id, e.name, e.email, e.phone, e.designation, e.role,
            e.date_of_joining, e.is_active, e.profile_photo, d.name AS department_name
     FROM employees e
     LEFT JOIN departments d ON e.department_id = d.id
     ORDER BY e.name ASC`
    );
    return rows;
};

const createEmployee = async (data) => {
    const { employee_id, name, email, password, phone, department_id, designation, role, date_of_joining, gender, date_of_birth, address } = data;
    const [result] = await db.query(
        `INSERT INTO employees (employee_id, name, email, password, phone, department_id, designation, role, date_of_joining, gender, date_of_birth, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, name, email, password, phone, department_id, designation, role, date_of_joining, gender, date_of_birth, address]
    );
    return result;
};

const updateEmployee = async (id, data) => {
    const { name, phone, department_id, designation, address, date_of_birth, gender, profile_photo } = data;
    const [result] = await db.query(
        `UPDATE employees SET name=?, phone=?, department_id=?, designation=?, address=?, date_of_birth=?, gender=?, profile_photo=?, updated_at=NOW()
     WHERE id=?`,
        [name, phone, department_id, designation, address, date_of_birth, gender, profile_photo, id]
    );
    return result;
};

const generateEmployeeId = async () => {
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM employees');
    const count = rows[0].count + 1;
    return `EMP${String(count).padStart(3, '0')}`;
};

module.exports = { findByEmail, findById, getAllEmployees, createEmployee, updateEmployee, generateEmployeeId };
