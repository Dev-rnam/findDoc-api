import { Router } from 'express';
import { loginHandler, refreshTokenHandler, signupHandler, verifyOtpHandler,  } from './auth.controller';


const router = Router();

// POST /api/auth/signup
router.post('/signup', signupHandler);
// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtpHandler);
router.post('/login', loginHandler);
router.post('/refresh-token', refreshTokenHandler);

export default router;