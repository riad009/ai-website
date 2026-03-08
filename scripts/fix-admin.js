require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function fixAdmin() {
    try {
        const passwordHash = await bcrypt.hash('Admin@123', 12);

        // Update existing admin's passwordHash
        const result = await pool.query(
            'UPDATE "User" SET "passwordHash" = $1 WHERE role = $2 RETURNING id, email, name, role',
            [passwordHash, 'ADMIN']
        );

        if (result.rows.length > 0) {
            console.log('Admin fixed successfully!');
            console.log('Email:', result.rows[0].email);
            console.log('Password: Admin@123');
        } else {
            console.log('No admin user found to fix.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

fixAdmin();
