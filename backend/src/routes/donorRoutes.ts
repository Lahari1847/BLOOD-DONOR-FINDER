import { Router } from 'express';
import {
  upsertDonorProfile,
  toggleAvailability,
  searchDonors,
  addDonationRecord,
  getDonorAnalytics,
  getDonorContactRequests,
  respondToContactRequest,
} from '../controllers/donorController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public search
router.get('/search', searchDonors);

// Protected donor actions
router.post('/profile', requireAuth, upsertDonorProfile);
router.post('/availability/toggle', requireAuth, toggleAvailability);
router.post('/records', requireAuth, addDonationRecord);
router.get('/analytics', requireAuth, getDonorAnalytics);
router.get('/contact-requests', requireAuth, getDonorContactRequests);
router.post('/contact-requests/:id/respond', requireAuth, respondToContactRequest);

export default router;
