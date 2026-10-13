import { Router } from 'express';
import { listHospitals, listBloodBanks, getPublicStats } from '../controllers/directoryController';

const router = Router();

router.get('/public-stats', getPublicStats);
router.get('/hospitals', listHospitals);
router.get('/blood-banks', listBloodBanks);

export default router;
