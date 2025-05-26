import pool from '../Backend/models/users.js';

beforeAll(async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    age INTEGER,
    reminderTime VARCHAR(5)
  )`);
  
  await pool.query(`CREATE TABLE IF NOT EXISTS entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title TEXT,
    content TEXT
  )`);
});

beforeEach(async () => {
  await pool.query('DELETE FROM entries');
  await pool.query('DELETE FROM users');
});

afterAll(async () => {
  await pool.end();
});
