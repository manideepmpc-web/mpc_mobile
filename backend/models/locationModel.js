const db = require('../config/db');

const updateLocation = async (employee_id, latitude, longitude, accuracy) => {
    const result = await db.query(
        `INSERT INTO employee_location (employee_id, latitude, longitude, accuracy)
     VALUES ($1, $2, $3, $4) RETURNING *`,
        [employee_id, latitude, longitude, accuracy]
    );
    return result.rows[0];
};

const getLatestLocation = async (employee_id) => {
    const result = await db.query(
        `SELECT * FROM employee_location WHERE employee_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
        [employee_id]
    );
    return result.rows[0];
};

const getAllLatestLocations = async () => {
    const result = await db.query(
        `SELECT el.*, e.name, e.employee_id AS emp_code
     FROM employee_location el
     JOIN employees e ON el.employee_id = e.id
     WHERE el.id IN (
       SELECT MAX(id) FROM employee_location GROUP BY employee_id
     )
     ORDER BY el.recorded_at DESC`
    );
    return result.rows;
};

const getLocationHistory = async (employee_id, hours = 8) => {
    const result = await db.query(
        `SELECT * FROM employee_location 
     WHERE employee_id = $1 AND recorded_at >= NOW() - INTERVAL '1 hour' * $2
     ORDER BY recorded_at DESC`,
        [employee_id, hours]
    );
    return result.rows;
};

module.exports = { updateLocation, getLatestLocation, getAllLatestLocations, getLocationHistory };
