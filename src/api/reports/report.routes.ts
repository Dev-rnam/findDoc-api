// src/api/reports/report.routes.ts
import { Router } from 'express';
import { createLostReportHandler, createFoundReportHandler, searchReportsHandler, validateReportHandler } from './report.controller';
import { authenticate, checkRole } from '../../middleware/auth.middleware';

const router = Router();

// Toutes les routes de ce fichier nécessitent une authentification
router.use(authenticate);

router.get('/', searchReportsHandler);


router.post('/lost', createLostReportHandler);

router.post('/found', createFoundReportHandler);

router.post('/:id/validate',checkRole(['ADMIN', 'POLICE']), validateReportHandler);

export default router;