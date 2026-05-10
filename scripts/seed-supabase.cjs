const { readFileSync } = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lksyatuvmtstsxvijkwc:HZ3AynYABHQhzn7v@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
  max: 1,
  ssl: { rejectUnauthorized: false },
});

const sql = readFileSync('scripts/seed.sql', 'utf8');

(async () => {
  try {
    await pool.query(sql);
    console.log('Seed completed successfully');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await pool.end();
  }
})();
