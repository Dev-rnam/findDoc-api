// src/api/reports/report.routes.ts
import { Router } from 'express';
import { createLostReportHandler, createFoundReportHandler } from './report.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Toutes les routes de ce fichier nécessitent une authentification
router.use(authenticate);

// POST /api/reports/lost
router.post('/lost', createLostReportHandler);

// POST /api/reports/found
router.post('/found', createFoundReportHandler);

export default router;