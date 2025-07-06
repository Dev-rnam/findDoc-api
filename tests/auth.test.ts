import request from 'supertest';
import app from '../src/app';

describe('Auth API', () => {
  const testUser = {
    email: `testuser_${Date.now()}@example.com`,
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'User',
    gender: 'M',
  };

  let accessToken: string;

  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    accessToken = res.body.accessToken;
  });

  it('should not login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword' });
    expect(res.statusCode).toBe(401);
  });
}); 