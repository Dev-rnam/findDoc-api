import request from 'supertest';
import app from '../app';

describe('Report Validation API', () => {
  let loserToken: string;
  let finderToken: string;
  let foundReportId: string;

  const loser = {
    email: `loser_${Date.now()}@example.com`,
    password: 'TestPassword123',
    firstName: 'Loser',
    lastName: 'User',
    gender: 'M',
  };

  const finder = {
    email: `finder_${Date.now()}@example.com`,
    password: 'TestPassword123',
    firstName: 'Finder',
    lastName: 'User',
    gender: 'F',
  };

  beforeAll(async () => {
    // Signup & login loser
    await request(app).post('/api/auth/signup').send(loser);
    const loserRes = await request(app)
      .post('/api/auth/login')
      .send({ email: loser.email, password: loser.password });
    loserToken = loserRes.body.accessToken;

    // Signup & login finder
    await request(app).post('/api/auth/signup').send(finder);
    const finderRes = await request(app)
      .post('/api/auth/login')
      .send({ email: finder.email, password: finder.password });
    finderToken = finderRes.body.accessToken;
  });

  it('should create a LOST and FOUND report and validate the FOUND report', async () => {
    // LOST report
    await request(app)
      .post('/api/reports/lost')
      .set('Authorization', `Bearer ${loserToken}`)
      .send({
        category: 'CNI',
        lat: 48.8566,
        lng: 2.3522,
        data: { documentNumber: 'VAL123' },
      });

    // FOUND report
    const foundRes = await request(app)
      .post('/api/reports/found')
      .set('Authorization', `Bearer ${finderToken}`)
      .send({
        category: 'CNI',
        lat: 48.8566,
        lng: 2.3522,
        data: { documentNumber: 'VAL123' },
      });
    expect(foundRes.statusCode).toBe(201);
    foundReportId = foundRes.body.id;

    // Attendre le matching automatique (si async)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Valider le rapport FOUND (nécessite un rôle ADMIN ou POLICE, à adapter selon ta logique)
    // Ici, on suppose que le finder a le droit de valider (sinon, il faut se connecter en admin)
    const validateRes = await request(app)
      .post(`/api/reports/${foundReportId}/validate`)
      .set('Authorization', `Bearer ${finderToken}`);
    expect(validateRes.statusCode).toBe(200);
    expect(validateRes.body).toHaveProperty('message');
    expect(validateRes.body).toHaveProperty('report');
  });
}); 