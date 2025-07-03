// src/api/reports/report.validation.ts
import { z } from 'zod';
import { Category } from '@prisma/client';

export const createReportSchema = z.object({
  body: z.object({
    category: z.nativeEnum(Category, {
      errorMap: () => ({ message: 'Catégorie invalide.' }),
    }),
    // GeoPoint
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    // 'data' est un objet JSON flexible pour les détails spécifiques au document
    data: z.record(z.any()).optional(),
  }),
});