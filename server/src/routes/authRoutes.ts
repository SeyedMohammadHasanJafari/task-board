import { Router } from 'express';
import {
  register,
  login,
  createGuest,
  getMe,
} from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/guest', createGuest);
router.get('/me', requireAuth, getMe);

export default router;
