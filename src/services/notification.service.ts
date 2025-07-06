import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createNotification(userId: string, message: string) {
  await prisma.notification.create({
    data: { userId, message },
  });
  console.log(`Notification créée pour ${userId}: "${message}"`);
}