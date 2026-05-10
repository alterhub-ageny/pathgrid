const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lksyatuvmtstsxvijkwc:HZ3AynYABHQhzn7v@aws-1-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require',
  max: 1,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const { rows } = await pool.query('SELECT email, "passwordHash", role FROM "User" WHERE email = $1', ['john@techventures.com']);
    if (rows.length === 0) {
      console.log('CLIENT USER NOT FOUND');
    } else {
      const u = rows[0];
      console.log('Found:', u.email, 'role:', u.role);
      console.log('Hash:', u.passwordHash);
      const tests = ['client123', 'admin123', 'password123', 'Client123', 'john123'];
      for (const pw of tests) {
        console.log(`  "${pw}" matches:`, bcrypt.compareSync(pw, u.passwordHash));
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
})();
