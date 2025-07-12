import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Diary',
  password: 'Akinwale123$',
  port: 5432,
});

try {
  const res = await pool.query('SELECT version()');
  console.log('Database connection successful:', res.rows[0].version);
} catch (err) {
  console.error('Database connection failed:', err);
} finally {
  await pool.end();
}
