import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  assignDeliveryBoy,
  exportOrders,
} from '../../controllers/orderController';

const router = Router();

router.use(auth, adminAuth);

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
];

// GET /api/admin/orders
router.get('/', getAllOrders);

// GET /api/admin/orders/export — CSV export
router.get('/export', exportOrders);

// PATCH /api/admin/orders/:id/status
router.patch('/:id/status', updateStatusValidation, updateOrderStatus);

// PATCH /api/admin/orders/:id/payment — mark paid/unpaid
router.patch(
  '/:id/payment',
  [body('paymentStatus').isIn(['paid', 'unpaid']).withMessage('paymentStatus must be paid or unpaid')],
  updatePaymentStatus
);

// PATCH /api/admin/orders/:id/assign — assign delivery boy
router.patch(
  '/:id/assign',
  [body('deliveryBoyId').optional({ nullable: true }).isUUID().withMessage('deliveryBoyId must be a valid UUID')],
  assignDeliveryBoy
);

export default router;
