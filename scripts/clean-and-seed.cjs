const { readFileSync } = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lksyatuvmtstsxvijkwc:HZ3AynYABHQhzn7v@aws-1-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require',
  max: 1,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    // Delete in FK-safe order
    console.log('Cleaning duplicate data...');
    await pool.query('DELETE FROM "Transaction"');
    await pool.query('DELETE FROM "InvoiceItem"');
    await pool.query('DELETE FROM "Invoice"');
    await pool.query('DELETE FROM "Project"');
    await pool.query('DELETE FROM "Message"');
    await pool.query('DELETE FROM "Asset"');
    await pool.query('DELETE FROM "LeadTask"');
    await pool.query('DELETE FROM "LeadInteraction"');
    await pool.query('DELETE FROM "Lead"');
    await pool.query('DELETE FROM "CalendarEvent"');
    await pool.query('DELETE FROM "Note"');
    await pool.query('DELETE FROM "Task"');
    await pool.query('DELETE FROM "Notification"');
    await pool.query('DELETE FROM "Activity"');
    await pool.query('DELETE FROM "ChatMessage"');
    await pool.query('DELETE FROM "BlogTranslation"');
    await pool.query('DELETE FROM "BlogPost"');
    await pool.query('DELETE FROM "PortfolioTranslation"');
    await pool.query('DELETE FROM "PortfolioItem"');
    await pool.query('DELETE FROM "ServiceTranslation"');
    await pool.query('DELETE FROM "Service"');
    await pool.query('DELETE FROM "TeamMemberTranslation"');
    await pool.query('DELETE FROM "TeamMember"');
    await pool.query('DELETE FROM "TestimonialTranslation"');
    await pool.query('DELETE FROM "Testimonial"');
    console.log('Cleanup done');

    // Re-seed
    const sql = readFileSync('scripts/seed.sql', 'utf8');
    await pool.query(sql);
    console.log('Re-seed completed successfully');
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    await pool.end();
  }
})();
