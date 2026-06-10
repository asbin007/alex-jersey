import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';
import { getAllUsers, updateUserRole } from '../../controllers/adminController';

const router = Router();

router.use(auth, adminAuth);

router.get('/', getAllUsers);

router.patch('/:id/role', [
  body('role').isIn(['customer', 'admin', 'delivery_boy']).withMessage('Role must be customer, admin, or delivery_boy'),
], updateUserRole);

export default router;
