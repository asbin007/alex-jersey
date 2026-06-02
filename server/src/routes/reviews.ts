import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import Review from '../models/Review';
import * as reviewService from '../services/reviewService';

const router = Router();

/**
 * Validation rules for review creation.
 * - productId: required, valid MongoDB ObjectId
 * - rating: required, integer between 1 and 5
 * - comment: required, minimum 10 characters
 * - images: optional array of strings
 */
const createReviewValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Comment must be at least 10 characters'),
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

/**
 * POST /api/reviews
 * Create a new review (authenticated users only).
 */
router.post('/', auth, createReviewValidation, async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const userId = req.user!.userId;
    const review = await reviewService.createReview(userId, {
      productId: req.body.productId,
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

/**
 * GET /api/reviews/product/:id
 * Get approved reviews for a product (public).
 */
router.get('/product/:id', [
  param('id').isMongoId().withMessage('Valid product ID is required'),
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
 * DELETE /api/reviews/:id
 * Delete a review — allowed for the review's owner or an admin.
 * Requires authentication. Admin can delete any review; a customer can only delete their own.
 */
router.delete('/:id', auth, [
  param('id').isMongoId().withMessage('Valid review ID is required'),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    const requestingUser = req.user!;
    const isOwner = review.user.toString() === requestingUser.userId;
    const isAdmin = requestingUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'You are not allowed to delete this review' });
      return;
    }

    await reviewService.deleteReview(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
