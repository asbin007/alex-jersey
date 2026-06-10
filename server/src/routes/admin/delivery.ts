import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';
import {
  createDeliveryBoyHandler,
  deleteDeliveryBoyHandler,
  getDeliveryBoysHandler,
} from '../../controllers/deliveryManagementController';

const router = Router();
router.use(auth, adminAuth);

// GET /api/admin/delivery-boys
router.get('/', getDeliveryBoysHandler);

// POST /api/admin/delivery-boys
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').matches(/^(97|98)\d{8}$/).withMessage('Valid Nepal phone required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  createDeliveryBoyHandler
);

// DELETE /api/admin/delivery-boys/:id
router.delete('/:id', deleteDeliveryBoyHandler);

export default router;
