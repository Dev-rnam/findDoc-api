// src/services/matching.service.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { Report, ReportFilters } from '../utils/types';
import { getBoundingBox } from '../utils/geo';
import { createNotification } from './notification.service';
 
const prisma = new PrismaClient();
const MATCHING_RADIUS_KM = 5;

// Fonction principale qui sera appelée après la création d'un rapport
export async function findAndProcessMatch(newReport: Report) {
  console.log(`[Matching Service] Recherche de match pour le rapport ${newReport.id}...`);

  // Déterminer quel type de rapport chercher
  const targetType = newReport.type === 'LOST' ? 'FOUND' : 'LOST';

  // 1. Calcul de la zone de recherche géographique
  const { minLat, maxLat, minLng, maxLng } = getBoundingBox(
    newReport.lat,
    newReport.lng,
    MATCHING_RADIUS_KM,
  );

  // 2. Définir les clés de données à comparer (ex: numéro de document, nom)
  const dataKeysToMatch: string[] = ['documentNumber', 'lastName'];
  const dataFilters: any[] = [];

  const newReportData = newReport.data as Record<string, any>;

  for (const key of dataKeysToMatch) {
    if (newReportData && newReportData[key]) {
      // Crée un filtre pour chercher un rapport où data[key] a la même valeur
      dataFilters.push({
        data: {
          path: [key],
          equals: newReportData[key],
        },
      });
    }
  }
  // Critères de recherche de base
  // 3. Construire la requête de recherche avancée
  const potentialMatches = await prisma.report.findMany({
    where: {
      // Critères de base
      type: targetType,
      status: 'PENDING',
      category: newReport.category,

      // Filtre géographique (Bounding Box)
      AND: [
        { lat: { gte: minLat, lte: maxLat } },
        { lng: { gte: minLng, lte: maxLng } },
      ],

      // Filtre par données (si des données pertinentes existent)
      // Si on a des filtres de données, on cherche un rapport qui correspond à AU MOINS UN d'entre eux.
      OR: dataFilters.length > 0 ? dataFilters : undefined,
    },
  });

  if (potentialMatches.length === 0) {
    console.log(`[Matching Service] Aucun match potentiel trouvé.`);
    return;
  }

  // Pour l'instant, on prend le premier match potentiel.
  // Une logique plus avancée pourrait scorer les résultats.
  const bestMatch = potentialMatches[0];
  console.log(`[Matching Service] Match trouvé ! Rapport ${newReport.id} <=> ${bestMatch.id}`);

  // Mettre à jour les deux rapports dans une transaction
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Mettre à jour le nouveau rapport
    await tx.report.update({
      where: { id: newReport.id },
      data: {
        status: 'MATCHED',
        // On lie le rapport trouvé à l'utilisateur qui a perdu l'objet
        matchedToId: targetType === 'LOST' ? bestMatch.createdById : newReport.createdById,
      },
    });

    // Mettre à jour le rapport existant
    await tx.report.update({
      where: { id: bestMatch.id },
      data: {
        status: 'MATCHED',
        matchedToId: targetType === 'LOST' ? bestMatch.createdById : newReport.createdById,
      },
    });
  });

  console.log(`[Matching Service] Rapports mis à jour avec le statut MATCHED.`);

  const loser = await prisma.user.findUnique({ where: { id: newReport.type === 'LOST' ? newReport.createdById : bestMatch.createdById } });
const finder = await prisma.user.findUnique({ where: { id: newReport.type === 'FOUND' ? newReport.createdById : bestMatch.createdById } });

if (loser && finder) {
  await createNotification(loser.id, `Bonne nouvelle ! Votre document a été retrouvé par ${finder.firstName}.`);
  await createNotification(finder.id, `Merci ! Votre signalement a été mis en correspondance avec le document perdu par ${loser.firstName}.`);
}
  // C'est ici qu'on déclencherait l'envoi de notifications (email, push)
  // await notificationService.notifyMatch(newReport.createdById, bestMatch.createdById);
}