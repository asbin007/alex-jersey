import mongoose from 'mongoose';
import Review, { ReviewDocument } from '../models/Review';
import Product from '../models/Product';
import { CreateReviewDTO } from '../types/dto';

/**
 * Check if a user has a delivered order containing the specified product.
 * Uses mongoose.model() with string reference to avoid hard dependency on Order model
 * (which may be created in parallel).
 */
async function checkVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
  try {
    const Order = mongoose.model('Order');
    const deliveredOrder = await Order.findOne({
      user: userId,
      status: 'delivered',
      'items.product': productId,
    });
    return !!deliveredOrder;
  } catch {
    // Order model may not be registered yet during development
    return false;
  }
}

/**
 * Check if a user has purchased (has any order with status delivered) a specific product.
 * Exported for use in route middleware / controllers.
 */
export async function hasPurchased(userId: string, productId: string): Promise<boolean> {
  return checkVerifiedPurchase(userId, productId);
}

/**
 * Create a new review for a product.
 * - Enforces one review per user per product (via compound unique index)
 * - Automatically sets isVerifiedPurchase based on delivered orders
 * - New reviews start as unapproved (isApproved: false)
 */
export async function createReview(
  userId: string,
  data: CreateReviewDTO
): Promise<ReviewDocument> {
  const isVerifiedPurchase = await checkVerifiedPurchase(userId, data.productId);

  const review = new Review({
    user: userId,
    product: data.productId,
    rating: data.rating,
    comment: data.comment,
    images: data.images || [],
    isVerifiedPurchase,
    isApproved: false,
  });

  const saved = await review.save();

  // Update the product's average rating (only approved reviews count, but recalculate in full)
  await updateProductRating(data.productId);

  return saved;
}

/**
 * Get approved reviews for a product (customer-facing).
 * Only returns reviews where isApproved is true.
 */
export async function getProductReviews(productId: string): Promise<ReviewDocument[]> {
  return Review.find({ product: productId, isApproved: true })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
}

/**
 * Approve a review (admin action).
 * Sets isApproved to true so the review becomes visible to customers.
 * Recalculates the product's average rating after approval.
 */
export async function approveReview(reviewId: string): Promise<ReviewDocument | null> {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { isApproved: true },
    { new: true }
  );
  if (review) {
    await updateProductRating(review.product.toString());
  }
  return review;
}

/**
 * Get all reviews for admin management (includes unapproved).
 */
export async function getAllReviews(): Promise<ReviewDocument[]> {
  return Review.find()
    .populate('user', 'name email')
    .populate('product', 'name slug')
    .sort({ createdAt: -1 });
}

/**
 * Get a single review by ID.
 */
export async function getReviewById(reviewId: string): Promise<ReviewDocument | null> {
  return Review.findById(reviewId)
    .populate('user', 'name email')
    .populate('product', 'name slug');
}

/**
 * Delete a review (admin or owner action).
 * Recalculates and updates the product's average rating and review count after deletion.
 */
export async function deleteReview(reviewId: string): Promise<ReviewDocument | null> {
  const review = await Review.findByIdAndDelete(reviewId);
  if (review) {
    await updateProductRating(review.product.toString());
  }
  return review;
}

/**
 * Recalculate and update a product's average rating and review count.
 * Only approved reviews are counted in the public-facing rating.
 */
export async function updateProductRating(productId: string): Promise<void> {
  const result = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgRating = result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
  const reviewCount = result.length > 0 ? result[0].count : 0;

  await Product.findByIdAndUpdate(productId, { rating: avgRating, reviewCount });
}
