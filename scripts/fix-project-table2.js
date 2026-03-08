require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function fix() {
    try {
        // Delete any orphan projects with no userId
        const del = await pool.query('DELETE FROM "Project" WHERE "userId" IS NULL');
        console.log(`Deleted ${del.rowCount} orphan projects`);

        // Now set userId to NOT NULL
        await pool.query('ALTER TABLE "Project" ALTER COLUMN "userId" SET NOT NULL');
        console.log('Set userId to NOT NULL');

        // Verify schema
        const r = await pool.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name='Project' ORDER BY ordinal_position");
        console.log('\nCurrent schema:');
        r.rows.forEach(c => console.log('  ', c.column_name.padEnd(20), c.is_nullable));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}
fix();
