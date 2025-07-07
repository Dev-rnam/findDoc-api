
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const CONVERSION_RATE = 100; // 100 points = 1 unité monétaire

export async function convertPoints(userId: string, points: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.points < points) {
    throw new Error('Points insuffisants pour la conversion.');
  }

  const moneyGained = points / CONVERSION_RATE;

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Mettre à jour le solde de l'utilisateur
    await tx.user.update({
      where: { id: userId },
      data: {
        points: { decrement: points },
        balance: { increment: moneyGained },
      },
    });
    // Créer l'historique de conversion
    const conversion = await tx.conversion.create({
      data: { userId, pointsConverted: points, moneyGained },
    });
    return conversion;
  });
}

export async function getHistory(userId: string) {
  return prisma.conversion.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}