require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS editor_data TEXT;
            ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS subdomain VARCHAR(255) UNIQUE;
            ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS published_html TEXT;
            ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
            ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
            ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255);
        `);
        console.log('Migration successful! Added editor columns to Project table.');
    } catch (err) {
        console.error('Migration error:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();
