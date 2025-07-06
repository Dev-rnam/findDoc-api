// src/api/reports/report.validation.ts
import { z } from 'zod';
import { Category, ReportStatus, ReportType } from '../../utils/types';


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

export const searchReportsSchema = z.object({
  query: z.object({
    type: z.nativeEnum(ReportType).optional(),
    category: z.nativeEnum(Category).optional(),
    status: z.nativeEnum(ReportStatus).optional(),
    // 'bounds' sera une chaîne de caractères "minLat,minLng,maxLat,maxLng"
    bounds: z.string().regex(/^(\-?\d+(\.\d+)?),(\-?\d+(\.\d+)?),(\-?\d+(\.\d+)?),(\-?\d+(\.\d+)?)$/, 'Format de bounds invalide.').optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  }),
});