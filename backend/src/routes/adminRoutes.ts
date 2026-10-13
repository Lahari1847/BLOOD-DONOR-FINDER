import { Router } from 'express';
import {
  getAdminAnalytics,
  listReports,
  updateReportStatus,
  togglePartnerVerification,
} from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Admin-only endpoints
router.get('/analytics', requireAuth, requireRole(['ADMIN']), getAdminAnalytics);
router.get('/reports', requireAuth, requireRole(['ADMIN']), listReports);
router.put('/reports/:id', requireAuth, requireRole(['ADMIN']), updateReportStatus);
router.put('/verify-partner/:type/:id', requireAuth, requireRole(['ADMIN']), togglePartnerVerification);

export default router;
