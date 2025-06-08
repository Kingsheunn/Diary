import request from 'supertest';
import app from '../Backend/app.js'; 
import pool from '../Backend/models/users.js';

let token;

// Create a valid token for testing
beforeAll(async () => {
  // Clean up database
  await pool.query('DELETE FROM users');

  // Register user for authentication tests
  const res = await request(app).post('/api/v1/usersController/signup').send({
    name: 'Samuel George',
    email: 'samuel@example.com',
    password: 'password'
  });

  // Login to get token
  const loginRes = await request(app).post('/api/v1/usersController/login').send({
    email: 'samuel@example.com',
    password: 'password'
  });

  token = loginRes.body.token;
});

describe('Users API ', () => {
  it('should not register with missing fields', async () => {
    const res = await request(app).post('/api/v1/usersController/signup').send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should not register an already existing user', async () => {
    const res = await request(app).post('/api/v1/usersController/signup').send({
      name: 'Samuel George',
      email: 'samuel@example.com',
      password: 'password'
    });
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should authenticate a valid user', async () => {
    const res = await request(app).post('/api/v1/usersController/login').send({
      email: 'samuel@example.com',
      password: 'password'
    });
    if (res.statusCode !== 200) {
    console.log('❌ Expected 200, got:', res.statusCode);
    console.log('Response body:', JSON.stringify(res.body, null, 2));
    console.log('Response text:', res.text);
  }
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not authenticate with missing fields', async () => {
    const res = await request(app).post('/api/v1/usersController/login').send({ password: 'password' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should not authenticate with wrong credentials', async () => {
    const res = await request(app).post('/api/v1/usersController/login').send({
      email: 'samuel@example.com',
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password');
  });

  it('should return user profile', async () => {
    const res = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'samuel@example.com');
  });

  it('should reject profile access with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', 'Bearer wrongtoken');
      console.log('JWT_KEY:', process.env.JWT_KEY);
    expect(res.statusCode).toBe(401);
  });

  it('should update user profile', async () => {
    const res = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
        email: 'updated@example.com'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Profile updated successfully');
  });

  it('should not update with invalid request', async () => {
    const res = await request(app)
      .put('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bad Field',
        email: 'badexample.com'
      });
    expect(res.statusCode).toBe(400);
  });

  it('should set reminder', async () => {
    const res = await request(app)
      .put('/api/v1/reminder')
      .set('Authorization', `Bearer ${token}`)
      .send({ remind: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Reminder set succesfully');
  });

  it('should reject bad reminder request', async () => {
    const res = await request(app)
      .put('/api/v1/reminder?remind=today')
      .set('Authorization', `Bearer ${token}`)
      .send({ remind: 'today' });
    expect(res.statusCode).toBe(400);
  });

  it('should get reminder status', async () => {
    const res = await request(app)
      .get('/api/v1/reminder')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.time[0]).toHaveProperty('reminder', true);
  });
});