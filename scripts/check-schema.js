require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const r = await p.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='Project' ORDER BY ordinal_position");
  r.rows.forEach(c => console.log(c.column_name.padEnd(25), c.data_type.padEnd(20), c.is_nullable));
  await p.end();
}
main().catch(e => { console.error(e); p.end(); });
