
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { convertPointsHandler, getHistoryHandler } from './point.controller';

const router = Router();
router.use(authenticate);

router.post('/convert', convertPointsHandler);
router.get('/history', getHistoryHandler);

export default router;