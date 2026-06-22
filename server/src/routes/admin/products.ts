import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
} from '../../controllers/productController';

const router = Router();

// All admin product routes require authentication + admin role
router.use(auth, adminAuth);

/**
 * Validation rules for product creation.
 * - name: required, non-empty
 * - description: required, non-empty
 * - price: must be a positive number
 * - images: must be an array with at least one image
 * - category: must be one of the allowed values
 * - team: required, non-empty
 * - jerseyType: must be one of the allowed values
 * - sizes: must be an array with at least one size having stock > 0
 */
const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('images.*')
    .isString()
    .notEmpty()
    .withMessage('Each image must be a valid URL string'),
  body('category')
    .isIn(['worldcup', 'retro', 'club', 'streetwear'])
    .withMessage('Category must be one of: worldcup, retro, club, streetwear'),
  body('team')
    .trim()
    .notEmpty()
    .withMessage('Team name is required'),
  body('jerseyType')
    .isIn(['home', 'away', 'third', 'retro', 'custom'])
    .withMessage('Jersey type must be one of: home, away, third, retro, custom'),
  body('sizes')
    .isArray({ min: 1 })
    .withMessage('At least one size is required'),
  body('sizes.*.size')
    .isIn(['S', 'M', 'L', 'XL', 'XXL'])
    .withMessage('Size must be one of: S, M, L, XL, XXL'),
  body('sizes.*.stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('sizes')
    .custom((sizes: { size: string; stock: number }[]) => {
      if (!Array.isArray(sizes)) return true; // Let the isArray check handle this
      const hasStockGreaterThanZero = sizes.some((s) => s.stock > 0);
      if (!hasStockGreaterThanZero) {
        throw new Error('At least one size must have stock greater than 0');
      }
      return true;
    }),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('compareAtPrice')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Compare at price must be a positive number'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  body('isLimitedDrop')
    .optional()
    .isBoolean()
    .withMessage('isLimitedDrop must be a boolean'),
  body('allowCustomization')
    .optional()
    .isBoolean()
    .withMessage('allowCustomization must be a boolean'),
  body('grade')
    .optional({ values: 'null' })
    .isIn(['A', 'B', null])
    .withMessage('Grade must be A, B, or null'),
  body('gradeDescription')
    .optional({ values: 'null' })
    .isString(),
];

/**
 * Validation rules for product update.
 * All fields are optional but validated if present.
 */
const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product description cannot be empty'),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),
  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('images.*')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Each image must be a valid URL string'),
  body('category')
    .optional()
    .isIn(['worldcup', 'retro', 'club', 'streetwear'])
    .withMessage('Category must be one of: worldcup, retro, club, streetwear'),
  body('team')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Team name cannot be empty'),
  body('jerseyType')
    .optional()
    .isIn(['home', 'away', 'third', 'retro', 'custom'])
    .withMessage('Jersey type must be one of: home, away, third, retro, custom'),
  body('sizes')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one size is required'),
  body('sizes.*.size')
    .optional()
    .isIn(['S', 'M', 'L', 'XL', 'XXL'])
    .withMessage('Size must be one of: S, M, L, XL, XXL'),
  body('sizes.*.stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('grade')
    .optional({ values: 'null' })
    .isIn(['A', 'B', null])
    .withMessage('Grade must be A, B, or null'),
  body('gradeDescription')
    .optional({ values: 'null' })
    .isString(),
];

// GET /api/admin/products - List all products (including inactive)
router.get('/', getAdminProducts);

// POST /api/admin/products - Create a new product
router.post('/', createProductValidation, createProduct);

// PUT /api/admin/products/:id - Update an existing product
router.put('/:id', updateProductValidation, updateProduct);

// DELETE /api/admin/products/:id - Soft delete a product
router.delete('/:id', deleteProduct);

export default router;
