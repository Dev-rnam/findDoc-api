// src/services/report.service.ts
import { PrismaClient, Report, ReportType, Category } from '@prisma/client';
import { findAndProcessMatch } from './matching.service';

const prisma = new PrismaClient();

interface CreateReportData {
  category: Category;
  lat: number;
  lng: number;
  data?: Record<string, any>;
  userId: string;
  type: ReportType;
}

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