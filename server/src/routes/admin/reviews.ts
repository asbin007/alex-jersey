import { Router, Request, Response } from 'express';
import { param, body, validationResult } from 'express-validator';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';
import * as reviewService from '../../services/reviewService';

const router = Router();

// All admin review routes require authentication + admin role
router.use(auth, adminAuth);

/**
 * GET /api/admin/reviews
 * Get all reviews for admin management (includes unapproved).
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * GET /api/admin/reviews/:id
 * Get a single review by ID.
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('Valid review ID is required'),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const review = await reviewService.getReviewById(req.params.id);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

/**
 * PATCH /api/admin/reviews/:id/approve
 * Approve a review (sets isApproved to true).
 */
router.patch('/:id/approve', [
  param('id').isMongoId().withMessage('Valid review ID is required'),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const review = await reviewService.approveReview(req.params.id);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to approve review' });
  }
});

/**
 * DELETE /api/admin/reviews/:id
 * Delete a review.
 */
router.delete('/:id', [
  param('id').isMongoId().withMessage('Valid review ID is required'),
], async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const review = await reviewService.deleteReview(req.params.id);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
