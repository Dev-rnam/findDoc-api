// src/api/auth/auth.routes.ts
import { Router } from 'express';
import { loginHandler, signupHandler, verifyOtpHandler,  } from './auth.controller';


const router = Router();

// POST /api/auth/signup
router.post('/signup', signupHandler);
// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtpHandler);
router.post('/login', loginHandler);

export default router;