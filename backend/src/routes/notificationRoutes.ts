import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, getNotifications);
router.put('/:id/read', requireAuth, markAsRead);
router.put('/read-all', requireAuth, markAllAsRead);

export default router;
