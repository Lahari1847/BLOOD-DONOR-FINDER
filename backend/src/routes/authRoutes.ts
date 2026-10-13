import { Router } from 'express';
import { register, login, getMe, updateProfile, deleteAccount } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.delete('/account', requireAuth, deleteAccount);

export default router;
