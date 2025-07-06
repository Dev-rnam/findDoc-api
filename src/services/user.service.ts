// src/services/user.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  gender?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

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

export async function updateUserProfile(userId: string, data: UpdateUserData) {
  const { firstName, lastName, gender, location } = data;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      gender,
      lat: location?.lat, 
      lng: location?.lng,
    },
    // On sélectionne les champs à retourner pour ne pas exposer le hash du mot de passe
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      gender: true,
      lat: true,
      lng: true,
      points: true,
    },
  });

  return updatedUser;
}