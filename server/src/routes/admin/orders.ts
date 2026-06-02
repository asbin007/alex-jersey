import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';
import { getAllOrders, updateOrderStatus } from '../../controllers/orderController';

const router = Router();

// All admin order routes require authentication + admin role
router.use(auth, adminAuth);

/**
 * Validation rules for order status update.
 * - status: must be one of the allowed order statuses
 */
const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled'),
];

// GET /api/admin/orders - Get all orders with populated details
router.get('/', getAllOrders);

// PATCH /api/admin/orders/:id/status - Update order status
router.patch('/:id/status', updateStatusValidation, updateOrderStatus);

export default router;
