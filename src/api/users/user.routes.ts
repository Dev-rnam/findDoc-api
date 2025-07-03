// src/api/users/user.routes.ts
import { Router } from 'express';
import { getMeHandler } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/users/me
// On place le middleware 'authenticate' AVANT le handler 'getMeHandler'.
// Seules les requêtes avec un token valide atteindront le handler.
router.get('/me', authenticate, getMeHandler);

export default router;