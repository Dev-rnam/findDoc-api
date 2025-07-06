import request from 'supertest';
import app from '../src/app';

describe('User API', () => {
  let accessToken: string;

  const testUser = {
    email: `usertest_${Date.now()}@example.com`,
    password: 'TestPassword123',
    firstName: 'User',
    lastName: 'Test',
    gender: 'F',
  };

  beforeAll(async () => {
    await request(app).post('/api/auth/signup').send(testUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    accessToken = res.body.accessToken;
  });

  it('should get my profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', testUser.email);
  });

  it('should update my profile', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Updated' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('firstName', 'Updated');
  });
}); 