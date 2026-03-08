require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

(async () => {
    const hash = await bcrypt.hash('123456', 12);
    await pool.query('UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE email = $2', [hash, 'admin@gmail.com']);
    console.log('Password reset to 123456 for admin@gmail.com');
    await pool.end();
})();
