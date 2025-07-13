import { Router } from 'express';
import { createLostReportHandler, createFoundReportHandler, searchReportsHandler, validateReportHandler } from './report.controller';
import { authenticate, checkRole } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Toutes les routes de ce fichier nécessitent une authentification
router.use(authenticate);

router.get('/', searchReportsHandler);


router.post('/lost', createLostReportHandler);

router.post('/found', createFoundReportHandler);

router.patch(
    '/:id/validate',
    checkRole([UserRole.ADMIN, UserRole.POLICE]),
    validateReportHandler
  );

export default router;