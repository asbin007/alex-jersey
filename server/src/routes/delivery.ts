import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth';
import { deliveryBoyAuth } from '../middleware/deliveryBoyAuth';
import { getMyDeliveries, updateDeliveryStatus } from '../controllers/deliveryController';

const router = Router();

// All delivery routes require auth + delivery_boy (or admin) role
router.use(auth, deliveryBoyAuth);

/**
 * GET /api/delivery/orders
 * Returns orders assigned to the authenticated delivery boy.
 * Admins get all assigned orders.
 */
router.get('/orders', getMyDeliveries);

/**
 * PATCH /api/delivery/orders/:id/status
 * Delivery boy can move an order to: ontheway, delivered
 */
router.patch(
  '/orders/:id/status',
  [
    body('status')
      .isIn(['ontheway', 'delivered'])
      .withMessage('Delivery boy can only set status to: ontheway, delivered'),
  ],
  updateDeliveryStatus
);

export default router;
