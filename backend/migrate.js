const db = require('./config/db');

async function migrate() {
    try {
        console.log('Running migration...');
        const { rows } = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'employees'
        `);
        const columnNames = rows.map(c => c.column_name);

        if (!columnNames.includes('otp_code')) {
            await db.query('ALTER TABLE employees ADD COLUMN otp_code VARCHAR(10)');
            console.log('✅ Added otp_code column.');
        }
        if (!columnNames.includes('otp_expiry')) {
            await db.query('ALTER TABLE employees ADD COLUMN otp_expiry TIMESTAMP');
            console.log('✅ Added otp_expiry column.');
        }
        
        console.log('✅ Migration check complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
