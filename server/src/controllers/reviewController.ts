import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as reviewService from '../services/reviewService';

/**
 * POST /api/reviews
 * Create a new review (authenticated users only).
 */
export async function createReview(req: Request, res: Response): Promise<void> {
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
    if (error.message?.includes('already reviewed')) {
      res.status(409).json({ error: 'You have already reviewed this product' });
      return;
    }
    res.status(500).json({ error: 'Failed to create review' });
  }
}

/**
 * GET /api/products/:id/reviews
 * Get approved reviews for a product (public).
 */
export async function getProductReviews(req: Request, res: Response): Promise<void> {
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
}

/**
 * DELETE /api/reviews/:id
 * Delete a review — allowed for the review owner or an admin.
 */
export async function deleteReview(req: Request, res: Response): Promise<void> {
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

    const requestingUser = req.user!;
    const isOwner = review.userId === requestingUser.userId;
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
}

// ============ Admin handlers ============

/**
 * GET /api/admin/reviews
 * Get all reviews for admin management (includes unapproved).
 */
export async function getAllReviews(_req: Request, res: Response): Promise<void> {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

/**
 * GET /api/admin/reviews/:id
 * Get a single review by ID (admin).
 */
export async function getReviewById(req: Request, res: Response): Promise<void> {
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
}

/**
 * PATCH /api/admin/reviews/:id/approve
 * Approve a review (sets isApproved to true).
 */
export async function approveReview(req: Request, res: Response): Promise<void> {
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
}

/**
 * DELETE /api/admin/reviews/:id
 * Delete any review (admin only).
 */
export async function adminDeleteReview(req: Request, res: Response): Promise<void> {
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
}
