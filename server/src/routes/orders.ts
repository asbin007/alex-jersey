import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController';

const router = Router();

// All order routes require authentication
router.use(auth);

/**
 * Validation rules for order creation.
 * - items: must be a non-empty array
 * - items.*.productId: required string
 * - items.*.quantity: must be a positive integer
 * - items.*.size: must be one of the allowed sizes
 * - customerName: required, non-empty
 * - phone: must be a valid Nepal phone number (10 digits starting with 97 or 98)
 * - deliveryAddress: required, non-empty
 * - city: required, non-empty
 */
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.productId')
    .isString()
    .notEmpty()
    .withMessage('Product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('items.*.size')
    .isIn(['S', 'M', 'L', 'XL', 'XXL'])
    .withMessage('Size must be one of: S, M, L, XL, XXL'),
  body('items.*.customName')
    .optional({ nullable: true, checkFalsy: false })
    .isString()
    .withMessage('Custom name must be a string')
    .bail()
    .isLength({ max: 20 })
    .withMessage('Custom name must not exceed 20 characters')
    .matches(/^[a-zA-Z0-9\s]*$/)
    .withMessage('Custom name must contain only letters, numbers and spaces'),
  body('items.*.customNumber')
    .optional({ nullable: true, checkFalsy: false })
    .isString()
    .withMessage('Custom number must be a string')
    .bail()
    .custom((value: string) => {
      if (value === '' || value === undefined || value === null) return true;
      const num = Number(value);
      if (!Number.isInteger(num) || num < 1 || num > 99) {
        throw new Error('Custom number must be an integer between 1 and 99');
      }
      return true;
    }),
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),
  body('phone')
    .matches(/^(97|98)\d{8}$/)
    .withMessage('Phone must be a valid Nepal number (10 digits starting with 97 or 98)'),
  body('deliveryAddress')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('note')
    .optional()
    .isString()
    .withMessage('Note must be a string'),
];

// POST /api/orders - Create a new order
router.post('/', createOrderValidation, createOrder);

// GET /api/orders/my-orders - Get current user's orders
// NOTE: this must be defined before /:id to avoid 'my-orders' being treated as an id param
router.get('/my-orders', getMyOrders);

// GET /api/orders/:id - Get a single order by ID (owner or admin)
router.get('/:id', getOrderById);

export default router;
