
import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';


// ...

const prisma = new PrismaClient();

describe('Parcours Utilisateur Complet', () => {
  const userData = {
    email: 'e2e-user@example.com',
    password: 'securePassword123',
    lastName: 'E2E',
  };

  it('doit permettre à un utilisateur de s\'inscrire, se connecter et accéder à son profil', async () => {
    // Étape 1: Inscription (on ignore la vérification OTP pour ce test)
    await request(app).post('/api/auth/signup').send(userData);

    // Simuler la validation du compte
    const user = await prisma.user.update({
      where: { email: userData.email },
      data: { isActive: true },
    });
    
    // Étape 2: Connexion
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty('accessToken');
    const { accessToken } = loginResponse.body;

    // Étape 3: Accéder à une route protégée
    const profileResponse = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`); // Utiliser le token

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.email).toBe(userData.email);
    expect(profileResponse.body.lastName).toBe('E2E');
  });
});