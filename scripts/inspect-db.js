require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function inspect() {
    try {
        const tables = await pool.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' ORDER BY table_name;
        `);
        console.log('=== TABLES ===');
        tables.rows.forEach(r => console.log(r.table_name));

        for (const row of tables.rows) {
            const cols = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = $1 
                ORDER BY ordinal_position;
            `, [row.table_name]);
            console.log(`\n=== ${row.table_name} ===`);
            cols.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable}, default: ${c.column_default})`));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

inspect();
