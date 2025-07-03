// src/services/user.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    // Sélectionner les champs à renvoyer pour ne pas exposer le mot de passe !
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      gender: true,
      lat: true,
      lng: true,
      points: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('Utilisateur non trouvé.');
  }

  return user;
}