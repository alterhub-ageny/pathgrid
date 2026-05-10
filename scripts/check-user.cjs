const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lksyatuvmtstsxvijkwc:HZ3AynYABHQhzn7v@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
  max: 1,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const { rows } = await pool.query('SELECT email, "passwordHash", role FROM "User" WHERE email = $1', ['admin@pathgrid.agency']);
    if (rows.length === 0) {
      console.log('USER NOT FOUND in Supabase');
    } else {
      const u = rows[0];
      console.log('Found user:', u.email, 'role:', u.role);
      console.log('Hash:', u.passwordHash.substring(0, 20) + '...');
      const match = bcrypt.compareSync('admin123', u.passwordHash);
      console.log('Password admin123 matches:', match);
    }

    const { rows: rows2 } = await pool.query('SELECT email FROM "User"');
    console.log('Total users:', rows2.length);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
})();
