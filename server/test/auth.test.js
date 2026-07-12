const request = require('supertest');
const app = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setup');

beforeAll(async () => connect());
afterEach(async () => clearDatabase());
afterAll(async () => closeDatabase());

describe('Auth', () => {
  it('registers a new user as a reporter regardless of a role in the request body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Reporter', email: 'reporter@test.com', password: 'Password123', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('reporter');
  });

  it('rejects login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'user@test.com', password: 'Password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('blocks access to a protected route without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects duplicate email registration', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'First', email: 'dup@test.com', password: 'Password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Second', email: 'dup@test.com', password: 'Password123' });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_IN_USE');
  });
});
