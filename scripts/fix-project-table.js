require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function fix() {
    try {
        // These columns were added by another project/migration sharing the same database.
        // They conflict with our schema. Drop them.
        const extraColumns = [
            'existing_buildings_data', 'user_id', 'updated_at', 'north_angle',
            'paid_at', 'plu_analysis_count', 'project_description',
            'authorization_type', 'authorization_explanation', 'departement',
            'citycode', 'coordinates', 'description', 'address', 'municipality',
            'parcel_ids', 'parcel_area', 'parcel_geometry', 'status',
            'project_type', 'scale', 'created_at'
        ];

        for (const col of extraColumns) {
            try {
                await pool.query(`ALTER TABLE "Project" DROP COLUMN IF EXISTS "${col}" CASCADE`);
                console.log(`Dropped: ${col}`);
            } catch (e) {
                console.log(`Skip ${col}: ${e.message}`);
            }
        }

        // Also make sure userId is NOT NULL (it was nullable in the current schema)
        await pool.query(`ALTER TABLE "Project" ALTER COLUMN "userId" SET NOT NULL`);
        console.log('Set userId to NOT NULL');

        console.log('\nDone! Project table cleaned up.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}
fix();
