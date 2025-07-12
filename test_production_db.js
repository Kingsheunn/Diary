import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;
dotenv.config();

async function testDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    // Test connection
    const client = await pool.connect();
    console.log('Connected to production database');
    
    // Create test table
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_users(
        id SERIAL PRIMARY KEY, 
        name TEXT
      )
    `);
    
    // Insert test user
    const userRes = await client.query(
      `INSERT INTO test_users(name) VALUES ($1) RETURNING *`, 
      ['Test User']
    );
    console.log('Created user:', userRes.rows[0]);
    
    // Get all users
    const users = await client.query('SELECT * FROM test_users');
    console.log('All users:', users.rows);
    
    // Cleanup
    await client.query('DROP TABLE IF EXISTS test_users');
    client.release();
    
    return { success: true };
  } catch (error) {
    console.error('Database test failed:', error);
    return { success: false, error };
  } finally {
    await pool.end();
  }
}

testDatabase();
