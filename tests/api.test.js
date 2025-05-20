import request from 'supertest';
import app from '../Backend/app.js';
import users from '../Backend/models/users.js';
import entries from '../Backend/models/entries.js';

describe('Users API', () => {
  // Reset the mock data before each test
  beforeEach(() => {
    users.length = 0;
    users.push({ id: 1, name: 'Alice', age: 30 });
  });
  

  test('GET /api/v1/users - should return all users', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Alice');
  });

  test('GET /api/v1/users/:id - should return a user by ID', async () => {
    const res = await request(app).get('/api/v1/users/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Alice');
  });

  test('POST /api/v1/users - should create a new user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ name: 'Bobby', age: 50 });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Bobby');
    expect(users).toHaveLength(2);
  });

  test('PUT /api/v1/users/:id - should update a user', async () => {
    const res = await request(app)
      .put('/api/v1/users/1')
      .send({ age: 31 });

    expect(res.statusCode).toBe(200);
    expect(res.body.age).toBe(31);
  });

  test('DELETE /api/v1/users/:id - should delete a user', async () => {
    const res = await request(app).delete('/api/v1/users/1');
    expect(res.statusCode).toBe(200);
    expect(users).toHaveLength(0);
  });

  test('GET /api/v1/users/999 - should return 404 for missing user', async () => {
    const res = await request(app).get('/api/v1/users/999');
    expect(res.statusCode).toBe(404);
  });
});


describe('Entries API', () => {
  beforeEach(() => {
    // Reset data before each test
    entries.length = 0;
    entries.push(
      { id: 1, userId: 5, title: 'My Title', body: 'The body', date: '5-7-2018' },
      { id: 2, userId: 6, title: 'My guitar experience', body: '', date: '5-8-2018' }
    );
  });

  test('GET /api/v1/entries - should return all entries', async () => {
    const res = await request(app).get('/api/v1/entries');
    expect(res.statusCode).toBe(200);
    expect(res.body.entries).toHaveLength(2);
  });

  test('GET /api/v1/entries/:id - should return a specific entry', async () => {
    const res = await request(app).get('/api/v1/entries/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.entry.id).toBe(1);
  });

  test('GET /api/v1/entries/:id - should return 404 if entry not found', async () => {
    const res = await request(app).get('/api/v1/entries/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Entry does not exist');
  });

  test('POST /api/v1/entries - should add a new entry', async () => {
    const newEntry = {
      userId: 7,
      title: 'New Entry',
      body: 'Something new',
      date: '2025-05-18'
    };

    const res = await request(app).post('/api/v1/entries').send(newEntry);
    expect(res.statusCode).toBe(201);
    expect(res.body.entry.title).toBe('New Entry');
    expect(entries).toHaveLength(3);
  });

  test('POST /api/v1/entries - should return 400 for invalid entry', async () => {
    const res = await request(app).post('/api/v1/entries').send({ title: '' });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /api/v1/entries/:id - should update an entry', async () => {
    const res = await request(app).put('/api/v1/entries/1').send({
      title: 'Updated Title',
      body: 'Updated body',
      date: '2025-05-19',
      userId: 5
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.entry.title).toBe('Updated Title');
  });

  test('PUT /api/v1/entries/:id - should return 404 if entry not found', async () => {
    const res = await request(app).put('/api/v1/entries/999').send({
      title: 'Doesn’t matter',
      body: 'Still won’t work',
      date: '2025-05-19',
      userId: 1
    });

    expect(res.statusCode).toBe(404);
  });

  test('DELETE /api/v1/entries/:id - should delete an entry', async () => {
    const res = await request(app).delete('/api/v1/entries/2');
    expect(res.statusCode).toBe(200);
    expect(entries).toHaveLength(1);
  });

  test('DELETE /api/v1/entries/:id - should return 404 for missing entry', async () => {
    const res = await request(app).delete('/api/v1/entries/999');
    expect(res.statusCode).toBe(404);
  });
});


describe('Notifications API', () => {
  beforeEach(() => {
    // Reset or seed mock users
    users.length = 0;
    users.push({ id: 1, name: 'Alice', age: 30 });
  });

  test('should set a reminder time for a valid user', async () => {
    const response = await request(app)
      .post('/api/v1/notifications')
      .send({ userId: 1, time: '20:00' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Reminder time set successfully');
    expect(response.body.time).toBe('20:00');
    expect(users[0].reminderTime).toBe('20:00');
  });

  test('should disable reminder if time is "off"', async () => {
    const response = await request(app)
      .post('/api/v1/notifications')
      .send({ userId: 1, time: 'off' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Reminder disabled successfully');
    expect(users[0].reminderTime).toBe('off');
  });

  test('should return 404 for non-existing user', async () => {
    const response = await request(app)
      .post('/api/v1/notifications')
      .send({ userId: 999, time: '20:00' });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
