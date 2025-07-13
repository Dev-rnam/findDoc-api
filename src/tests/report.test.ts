import request from 'supertest';
import app from '../app';

describe('Report API', () => {
  let accessToken: string;
  let reportId: string;

  const testUser = {
    email: `reportuser_${Date.now()}@example.com`,
    password: 'TestPassword123',
    firstName: 'Report',
    lastName: 'User',
    gender: 'F',
  };

  beforeAll(async () => {
    // Signup
    await request(app).post('/api/auth/signup').send(testUser);
    // Login
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    accessToken = res.body.accessToken;
  });

  it('should create a lost report', async () => {
    const res = await request(app)
      .post('/api/reports/lost')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        category: 'CNI',
        lat: 48.8566,
        lng: 2.3522,
        data: { documentNumber: 'ABC123' },
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    reportId = res.body.id;
  });

  it('should search for reports', async () => {
    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
}); 