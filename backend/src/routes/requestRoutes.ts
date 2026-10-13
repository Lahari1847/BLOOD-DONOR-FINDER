import { Router } from 'express';
import {
  createRequest,
  listEmergencyRequests,
  listMyRequests,
  sendContactRequestToDonor,
  updateRequestStatus,
  reportAbuse,
} from '../controllers/requestController';
import { requireAuth } from '../middleware/auth';
import { requestCreationLimiter, contactLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public emergency feed
router.get('/emergency', listEmergencyRequests);

// Protected requester actions
router.post('/create', requireAuth, requestCreationLimiter, createRequest);
router.get('/my-requests', requireAuth, listMyRequests);
router.post('/contact', requireAuth, contactLimiter, sendContactRequestToDonor);
router.put('/:id/status', requireAuth, updateRequestStatus);
router.post('/report', requireAuth, reportAbuse);

export default router;
