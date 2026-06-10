import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';
import { getDashboardStats } from '../../controllers/adminController';

const router = Router();

router.use(auth, adminAuth);
router.get('/stats', getDashboardStats);

export default router;
