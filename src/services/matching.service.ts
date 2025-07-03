// src/services/matching.service.ts
import { PrismaClient, Report } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction principale qui sera appelée après la création d'un rapport
export async function findAndProcessMatch(newReport: Report) {
  console.log(`[Matching Service] Recherche de match pour le rapport ${newReport.id}...`);

  // Déterminer quel type de rapport chercher
  const targetType = newReport.type === 'LOST' ? 'FOUND' : 'LOST';

  // Critères de recherche de base
  const potentialMatches = await prisma.report.findMany({
    where: {
      type: targetType,          // Cherche le type opposé (LOST <-> FOUND)
      status: 'PENDING',         // Uniquement les rapports non encore matchés
      category: newReport.category, // Doit être de la même catégorie
      // TODO: Ajouter une recherche plus fine sur le champ 'data' (numéro de document, nom...)
      // TODO: Ajouter une recherche géographique (dans un rayon de X km)
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
  await prisma.$transaction(async (tx) => {
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
  // C'est ici qu'on déclencherait l'envoi de notifications (email, push)
  // await notificationService.notifyMatch(newReport.createdById, bestMatch.createdById);
}