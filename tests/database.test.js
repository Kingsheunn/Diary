import request from 'supertest';
import app from '../Backend/app.js';
import pool from '../Backend/models/users.js';
import '../tests/setupTestDB.js';

describe('Entries API', () => {
  let userId;

  beforeEach(async () => {
    const userRes = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      ['Test User', 25, '20:00']
    );
    userId = userRes.rows[0].id;
  });
  
  test("should create a new user", async () => {
    const res = await request(app).post("/api/v1/users").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "testpass123",
    });
    const allUsers = await pool.query("SELECT * FROM users");
    console.log("Users after creation:", allUsers.rows);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Test User");
    expect(res.body.email).toBe("testuser@example.com");
    userId = Number(res.body.id); // Ensure userId is a number
  });

  test("should fetch all users", async () => {
    const res = await request(app).get("/api/v1/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("should fetch a user by ID", async () => {
    const res = await request(app).get(`/api/v1/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(Number(res.body.id)).toBe(userId); // Compare as numbers
    expect(res.body.name).toBe("Test User");
  });

  test("should update a user", async () => {
    const res = await request(app).put(`/api/v1/users/${userId}`).send({
      name: "Updated User",
      email: "updated@example.com",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated User");
    expect(res.body.email).toBe("updated@example.com");
  });

  test("should delete a user", async () => {
    const res = await request(app).delete(`/api/v1/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  test("should return 404 for non-existent user", async () => {
    const res = await request(app).get(`/api/v1/users/999999`);
    expect(res.statusCode).toBe(404);
  });

  test('should create a new entry', async () => {
    const res = await request(app)
      .post('/api/v1/entries')
      .send({ user_id: userId, title: 'My Day', content: 'It was great!' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('My Day');
    console.log(res.body);

  });

  test('should fetch all entries', async () => {
    await pool.query(
      'INSERT INTO entries (user_id, title, content) VALUES ($1, $2, $3)',
      [userId, 'Entry One', 'Content one']
    );

    const res = await request(app).get('/api/v1/entries');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('should update an entry', async () => {
    const { rows } = await pool.query(
      'INSERT INTO entries (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, 'Old Title', 'Old content']
    );

    const res = await request(app)
      .put(`/api/v1/entries/${rows[0].id}`)
      .send({ title: 'New Title', content: 'Updated content' });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('New Title');
  });

  test('should delete an entry', async () => {
    const { rows } = await pool.query(
      'INSERT INTO entries (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, 'To Delete', 'Delete me']
    );

    const res = await request(app).delete(`/api/v1/entries/${rows[0].id}`);
    expect(res.statusCode).toBe(200);
  });
});
