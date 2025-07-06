import { createNotification } from '../src/services/notification.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Notification Service', () => {
  let userId: string;

  beforeAll(async () => {
    // Crée un utilisateur de test
    const user = await prisma.user.create({
      data: {
        email: `notifuser_${Date.now()}@example.com`,
        passwordHash: 'hash',
        isActive: true,
      },
    });
    userId = user.id;
  });

  it('should create a notification', async () => {
    await createNotification(userId, 'Test notification');
    const notif = await prisma.notification.findFirst({
      where: { userId, message: 'Test notification' },
    });
    expect(notif).not.toBeNull();
    expect(notif?.message).toBe('Test notification');
  });
}); 