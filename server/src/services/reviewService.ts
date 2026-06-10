import { sequelize } from '../config/db';
import { Product, Order, OrderItem, Review, User } from '../models/associations';
import { CreateReviewDTO } from '../types/dto';

/**
 * Check if a user has a delivered order containing the specified product.
 */
async function checkVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
  try {
    const deliveredOrder = await Order.findOne({
      where: {
        userId,
        status: 'delivered',
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          where: { productId },
          required: true,
        },
      ],
    });
    return !!deliveredOrder;
  } catch {
    return false;
  }
}

/**
 * Check if a user has purchased (has any order with status delivered) a specific product.
 */
export async function hasPurchased(userId: string, productId: string): Promise<boolean> {
  return checkVerifiedPurchase(userId, productId);
}

/**
 * Create a new review for a product.
 * - Enforces one review per user per product
 * - Automatically sets isVerifiedPurchase based on delivered orders
 * - New reviews start as unapproved (isApproved: false)
 */
export async function createReview(
  userId: string,
  data: CreateReviewDTO
): Promise<any> {
  const isVerifiedPurchase = await checkVerifiedPurchase(userId, data.productId);

  // Check if a review already exists for this user and product
  const existingReview = await Review.findOne({
    where: { userId, productId: data.productId },
  });

  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }

  const review = await Review.create({
    userId,
    productId: data.productId,
    rating: data.rating,
    comment: data.comment,
    images: data.images || [],
    isVerifiedPurchase,
    isApproved: false,
  });

  // Update the product's average rating
  await updateProductRating(data.productId);

  return review;
}

/**
 * Get approved reviews for a product (customer-facing).
 * Only returns reviews where isApproved is true.
 */
export async function getProductReviews(productId: string): Promise<any[]> {
  return Review.findAll({
    where: { productId, isApproved: true },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'avatar'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
}

/**
 * Approve a review (admin action).
 * Sets isApproved to true so the review becomes visible to customers.
 * Recalculates the product's average rating after approval.
 */
export async function approveReview(reviewId: string): Promise<any | null> {
  const review = await Review.findByPk(reviewId);
  if (!review) return null;

  await review.update({ isApproved: true });
  await updateProductRating(review.productId);

  return review;
}

/**
 * Get all reviews for admin management (includes unapproved).
 */
export async function getAllReviews(): Promise<any[]> {
  return Review.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'email'],
      },
      {
        model: Product,
        as: 'product',
        attributes: ['name', 'slug'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
}

/**
 * Get a single review by ID.
 */
export async function getReviewById(reviewId: string): Promise<any | null> {
  return Review.findByPk(reviewId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'email'],
      },
      {
        model: Product,
        as: 'product',
        attributes: ['name', 'slug'],
      },
    ],
  });
}

/**
 * Delete a review (admin or owner action).
 * Recalculates and updates the product's average rating and review count after deletion.
 */
export async function deleteReview(reviewId: string): Promise<any | null> {
  const review = await Review.findByPk(reviewId);
  if (!review) return null;

  await review.destroy();
  await updateProductRating(review.productId);

  return review;
}

/**
 * Recalculate and update a product's average rating and review count.
 * Only approved reviews are counted in the public-facing rating.
 */
export async function updateProductRating(productId: string): Promise<void> {
  const stats = await Review.findOne({
    where: { productId, isApproved: true },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount'],
    ],
    raw: true,
  }) as any;

  const avgRating = stats?.avgRating ? Math.round(Number(stats.avgRating) * 10) / 10 : 0;
  const reviewCount = stats?.reviewCount ? Number(stats.reviewCount) : 0;

  const product = await Product.findByPk(productId);
  if (product) {
    await product.update({ rating: avgRating, reviewCount });
  }
}
