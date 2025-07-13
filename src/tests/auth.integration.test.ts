
import request from 'supertest';
import app from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Nettoyer la DB après chaque test
afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/signup', () => {
  it('doit créer un nouvel utilisateur et renvoyer un statut 201', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      lastName: 'Test',
    };

    const response = await request(app)
      .post('/api/auth/signup')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('userId');
    expect(response.body.message).toContain('Utilisateur créé');

    // Vérifier que l'utilisateur est bien en base de données
    const userInDb = await prisma.user.findUnique({ where: { email: userData.email } });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.lastName).toBe('Test');
  });

  it('doit renvoyer une erreur 409 si l\'email existe déjà', async () => {
    // ... (créer un utilisateur d'abord)
  });
});