// src/api/users/user.routes.ts
import { Router } from 'express';
import { getMeHandler, updateMeHandler } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', getMeHandler);

router.patch('/me', updateMeHandler);

export default router;