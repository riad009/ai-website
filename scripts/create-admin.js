require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function createAdmin() {
    try {
        // Check if admin exists
        const existing = await pool.query('SELECT id, email, name, role FROM "User" WHERE role = $1', ['ADMIN']);
        if (existing.rows.length > 0) {
            console.log('Admin already exists:', existing.rows[0].email);
            await pool.end();
            return;
        }

        // Create admin account
        const id = 'admin_' + Date.now().toString(36);
        const password = await bcrypt.hash('Admin@123', 12);

        await pool.query(
            'INSERT INTO "User" (id, email, "passwordHash", name, role, tokens, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
            [id, 'admin@siteforge.ai', password, 'Admin', 'ADMIN', 9999]
        );

        console.log('Admin account created!');
        console.log('Email: admin@siteforge.ai');
        console.log('Password: Admin@123');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

createAdmin();
