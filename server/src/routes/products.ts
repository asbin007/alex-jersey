import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
  getProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  validateCustomization,
} from '../controllers/productController';
import { auth } from '../middleware/auth';
import * as reviewService from '../services/reviewService';

const router = Router();

// GET /api/products - List products with filters, search, pagination, sorting
router.get('/', getProducts);

// GET /api/products/:id/reviews/status - Check if authenticated user can review
router.get('/:id/reviews/status', auth, [
  param('id').isUUID().withMessage('Valid product ID is required'),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const status = await reviewService.getReviewStatus(req.user!.userId, req.params.id);
    res.json(status);
  } catch {
    res.status(500).json({ error: 'Failed to fetch review status' });
  }
});

// GET /api/products/:id/reviews - Get approved reviews for a product (public)
router.get('/:id/reviews', [
  param('id').isUUID().withMessage('Valid product ID is required'),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const reviews = await reviewService.getProductReviews(req.params.id);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * Validation rules for review creation.
 * - rating: required, integer 1-5
 * - comment: required, 10-500 characters
 * - images: optional array of URL strings
 */
const createReviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Each image must be a valid URL string'),
];

// POST /api/products/:id/reviews - Submit a review (authenticated, must have purchased)
router.post('/:id/reviews', auth, [
  param('id').isUUID().withMessage('Valid product ID is required'),
  ...createReviewValidation,
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const userId = req.user!.userId;
  const productId = req.params.id;

  try {
    const review = await reviewService.createReview(userId, {
      productId,
      rating: req.body.rating,
      comment: req.body.comment,
      images: req.body.images,
    });

    res.status(201).json(review);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'You have already reviewed this product' });
      return;
    }
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// GET /api/products/:id/related - Get related products
router.get('/:id/related', getRelatedProducts);

// POST /api/products/:id/validate-customization - Validate customization for a product
router.post('/:id/validate-customization', validateCustomization);

// GET /api/products/:idOrSlug - Get single product by ID or slug
// Note: placed last so it doesn't shadow more specific sub-routes above
router.get('/:idOrSlug', getProductByIdOrSlug);

export default router;
