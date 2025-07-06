// src/services/report.service.ts
import { PrismaClient, Prisma} from '@prisma/client';
import { findAndProcessMatch } from './matching.service';
import { Category, ReportStatus, ReportType } from '../utils/types';

const prisma = new PrismaClient();

interface CreateReportData {
  category: Category;
  lat: number;
  lng: number;
  data?: Record<string, any>;
  userId: string;
  type: ReportType;
}

interface SearchFilters {
  type?: ReportType;
  category?: Category;
  status?: ReportStatus;
  bounds?: string;
  page?: number;
  limit?: number;
}

const POINTS_PER_VALIDATION = 10;

export async function createReport(data: CreateReportData): Promise<Report> {
  const { type, category, lat, lng, userId, data: reportData } = data;

  const newReport = await prisma.report.create({
    data: {
      type,
      category,
      lat,
      lng,
      createdById: userId,
      data: reportData || {},
      status: 'PENDING', // Toujours en attente au début
    },
  });

  // Déclencher le matching de manière asynchrone (sans attendre la fin)
  findAndProcessMatch(newReport).catch(console.error);

  return newReport;
}

export async function validateFoundReport(reportId: string) {
  // 1. Trouver le rapport et s'assurer qu'il est "FOUND" et "MATCHED"
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new Error('Rapport non trouvé.');
  }
  if (report.type !== 'FOUND') {
    throw new Error('Seuls les rapports de type "FOUND" peuvent être validés.');
  }
  if (report.status !== 'MATCHED') {
    throw new Error('Le rapport doit être "MATCHED" avant d\'être validé.');
  }
  if (report.validated) {
    throw new Error('Ce rapport a déjà été validé.');
  }

  // 2. Mettre à jour le rapport et créditer les points à l'utilisateur (transaction)
  const updatedReport = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Marquer le rapport comme validé
    const validatedReport = await tx.report.update({
      where: { id: reportId },
      data: { validated: true },
    });

    // Créditer les points à l'utilisateur qui a trouvé l'objet
    await tx.user.update({
      where: { id: report.createdById },
      data: {
        points: {
          increment: POINTS_PER_VALIDATION,
        },
      },
    });

    return validatedReport;
  });

  return {
    message: `Rapport validé. ${POINTS_PER_VALIDATION} points crédités à l'utilisateur ${report.createdById}.`,
    report: updatedReport,
  };
}

export async function searchReports(filters: SearchFilters) {
  const { type, category, status, bounds, page = 1, limit = 20 } = filters;

  const where: Record<string, any> = {};

  if (type) where.type = type;
  if (category) where.category = category;
  if (status) where.status = status;

  if (bounds) {
    const [minLat, minLng, maxLat, maxLng] = bounds.split(',').map(parseFloat);
    where.AND = [
      { lat: { gte: minLat, lte: maxLat } },
      { lng: { gte: minLng, lte: maxLng } },
    ];
  }

  const reports = await prisma.report.findMany({
    where,
    // Trier par date de création, du plus récent au plus ancien
    orderBy: { createdAt: 'desc' },
    // Gérer la pagination
    skip: (page - 1) * limit,
    take: limit,
    // Inclure des informations sur l'utilisateur qui a créé le rapport
    include: {
      createdBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });
  
  const totalReports = await prisma.report.count({ where });

  return { 
    data: reports,
    total: totalReports,
    page,
    limit,
    totalPages: Math.ceil(totalReports / limit)
  };
}