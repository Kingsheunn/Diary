import request from 'supertest';
import app from '../Backend/app.js';

process.env.JWT_SECRET = 'test-secret-key-123';
process.env.JWT_KEY = 'test-secret-key-123'; 
process.env.NODE_ENV = 'test';

describe('Diary Entries', () => {
  let token;
  let entryId;

  // Login before tests
  beforeAll(async () => {
    try{
    // Create user
    const signup = await request(app)
      .post('/api/v1/usersController/signup')
      .send({
        name: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    console.log('Signup response:', signup.status, signup.body);

    // Login user
    const login = await request(app)
      .post('/api/v1/usersController/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    console.log('Login response:', login.status, login.body);
    
      token = login.body.token || login.body.data?.token || login.body.accessToken;


   if (!token) {
        console.log('Login response:', login.body);
        throw new Error('No token received from login');
      }
    } catch (error) {
      console.error('Setup failed:', error.message);
    }
  });


  test('Create new entry', async () => {
    const entry = {
      title: 'My Test Entry',
      content: 'This is my diary entry content',
      date: new Date().toISOString()
    };

    const response = await request(app)
      .post('/api/v1/entries')
      .set('Authorization', `Bearer ${token}`)
      .send(entry);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('My Test Entry');
    entryId = response.body.id;
  });

test('Login should return token', async () => {
  const response = await request(app)
    .post('/api/v1/usersController/login')
    .send({
      email: 'test@example.com',
      password: 'password123'
    });
  expect(response.body.token).toBeDefined();
});

  test('Get all entries', async () => {
    const response = await request(app)
      .get('/api/v1/entries')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.entries).toBeDefined();
    expect(response.body.entries.length).toBeGreaterThan(0);
  });

  test('Get single entry', async () => {
    const response = await request(app)
      .get(`/api/v1/entries/${entryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.entry.title).toBe('My Test Entry');
  });

  test('Update entry', async () => {
    const update = {
      user_id: 1,
      title: 'Updated Entry',
      content: 'Updated content',
      date: new Date().toISOString()
    };

    const response = await request(app)
      .put(`/api/v1/entries/${entryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(update);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Entry');
  });

  test('Delete entry', async () => {
    const response = await request(app)
      .delete(`/api/v1/entries/${entryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Entry deleted successfully');
  });

  test('Create entry without title should fail', async () => {
    const entry = {
      user_id: 1,
      content: 'Content without title',
      date: new Date().toISOString()
    };

    const response = await request(app)
      .post('/api/v1/entries')
      .set('Authorization', `Bearer ${token}`)
      .send(entry);

    expect(response.status).toBe(400);
  });

  // Authentication Tests
  test('Should fail without token', async () => {
    const response = await request(app)
      .get('/api/v1/entries');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Access denied. No token provided.');
    expect(response.body.status).toBe('error');
  });

  test('Should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/entries')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid token.');
    expect(response.body.status).toBe('error');
  });

  test('Should work with x-auth-token header', async () => {
    const response = await request(app)
      .get('/api/v1/entries')
      .set('x-auth-token', token);

    expect(response.status).toBe(200);
    expect(response.body.entries).toBeDefined();
  });

  test('Should work with Authorization Bearer header', async () => {    
    const response = await request(app)
      .get('/api/v1/entries')
      .set('Authorization', `Bearer ${token}`);

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    if (response.status === 401) {
      console.log('Token validation failed');
    }

    expect(response.status).toBe(200);
    expect(response.body.entries).toBeDefined();
  });

  test('Debug: Check if routes are registered', async () => {
  const response = await request(app).get('/api/v1');
  console.log('Welcome route status:', response.status);
  expect(response.status).toBe(200);
});
});