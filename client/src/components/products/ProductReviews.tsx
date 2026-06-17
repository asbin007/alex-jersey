import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Star, Loader2, CheckCircle2, Clock, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  fetchProductReviews,
  fetchReviewStatus,
  submitProductReview,
} from '@/services/productService'
import { normalizeReview } from '@/lib/normalize'
import type { Review } from '@/types'

interface Props {
  productId: string
  productRating: number
  reviewCount: number
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-3 w-3 sm:h-3.5 sm:w-3.5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`${cls} ${
            s <= Math.round(rating)
              ? 'fill-[#FFD700] text-[#FFD700]'
              : 'fill-[#1a1a1a] text-[#1a1a1a]'
          }`}
        />
      ))}
    </div>
  )
}

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => {
        const active = s <= (hover || value)
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="rounded p-0.5 transition-transform hover:scale-110"
            aria-label={`Rate ${s} stars`}
          >
            <Star
              className={`h-7 w-7 sm:h-8 sm:w-8 ${
                active ? 'fill-[#FFD700] text-[#FFD700]' : 'fill-[#222] text-[#222]'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const initial = review.userName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#080808] p-4 sm:rounded-2xl sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFD700] text-sm font-black text-black">
            {initial}
          </div>
          <div>
            <p className="text-sm font-black text-white">{review.userName ?? 'Customer'}</p>
            <p className="text-[10px] text-[#555]">
              {new Date(review.createdAt).toLocaleDateString('en-NP', {
                month: 'short',
                year: 'numeric',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StarDisplay rating={review.rating} />
          {review.isVerifiedPurchase && (
            <span className="tag-gold text-[9px]">✓ Verified Purchase</span>
          )}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-[#888]">&ldquo;{review.comment}&rdquo;</p>
    </div>
  )
}

export default function ProductReviews({ productId, productRating, reviewCount }: Props) {
  const { isAuthenticated } = useAuth()

  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState(false)

  const [canReview, setCanReview] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [pendingReview, setPendingReview] = useState<Review | null>(null)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true)
    try {
      const data = await fetchProductReviews(productId)
      setReviews(data)
    } catch {
      setReviews([])
    } finally {
      setLoadingReviews(false)
    }
  }, [productId])

  const loadStatus = useCallback(async () => {
    if (!isAuthenticated) {
      setCanReview(false)
      setHasPurchased(false)
      setHasReviewed(false)
      setPendingReview(null)
      return
    }

    setLoadingStatus(true)
    try {
      const status = await fetchReviewStatus(productId)
      setHasPurchased(status.hasPurchased)
      setHasReviewed(status.hasReviewed)
      setCanReview(status.canReview)
      if (status.review) {
        setPendingReview(normalizeReview(status.review))
      } else {
        setPendingReview(null)
      }
    } catch {
      setCanReview(false)
    } finally {
      setLoadingStatus(false)
    }
  }, [productId, isAuthenticated])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Please select a star rating')
      return
    }
    if (comment.trim().length < 10) {
      setError('Review must be at least 10 characters')
      return
    }

    setSubmitting(true)
    try {
      const created = await submitProductReview(productId, {
        rating,
        comment: comment.trim(),
      })
      setSuccess(true)
      setCanReview(false)
      setHasReviewed(true)
      setPendingReview(created)
      setRating(0)
      setComment('')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to submit review. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mb-14 sm:mb-20">
      {/* Header + summary */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-black text-white sm:text-2xl">
            Customer Reviews
          </h2>
          <p className="mt-1 text-sm text-[#555]">
            {reviewCount > 0
              ? `${reviewCount} review${reviewCount === 1 ? '' : 's'} · ${productRating} average`
              : 'No reviews yet — be the first!'}
          </p>
        </div>
        {reviewCount > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-[#1a1a1a] bg-[#080808] px-4 py-3">
            <span className="text-3xl font-black text-[#FFD700]">{productRating}</span>
            <div>
              <StarDisplay rating={productRating} size="md" />
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#555]">
                Overall rating
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Write review panel */}
      <div className="mb-8 rounded-2xl border border-[#1a1a1a] bg-[#050505] p-5 sm:p-6">
        <h3 className="mb-4 text-sm font-black uppercase tracking-wider text-white">
          Write a Review
        </h3>

        {!isAuthenticated ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#666]">Sign in to share your experience with this jersey.</p>
            <Link
              to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
              className="btn-gold shrink-0 rounded-xl px-5 py-2.5 text-sm font-black"
            >
              Sign In to Review
            </Link>
          </div>
        ) : loadingStatus ? (
          <div className="flex items-center gap-2 text-sm text-[#555]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking eligibility…
          </div>
        ) : success || (hasReviewed && pendingReview) ? (
          <div className="flex items-start gap-3 rounded-xl border border-[#FFD700]/20 bg-[#FFD700]/5 p-4">
            {pendingReview?.isApproved ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
            ) : (
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#FFD700]" />
            )}
            <div>
              <p className="text-sm font-black text-white">
                {pendingReview?.isApproved
                  ? 'Your review is live!'
                  : 'Review submitted — pending approval'}
              </p>
              <p className="mt-1 text-xs text-[#666]">
                {pendingReview?.isApproved
                  ? 'Thank you for sharing your feedback with other fans.'
                  : 'Our team will approve your review shortly. You\'ll see it here once published.'}
              </p>
              {pendingReview && !pendingReview.isApproved && (
                <div className="mt-3 rounded-lg border border-[#1a1a1a] bg-black/40 p-3">
                  <StarDisplay rating={pendingReview.rating} />
                  <p className="mt-2 text-sm text-[#777]">&ldquo;{pendingReview.comment}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        ) : !hasPurchased ? (
          <div className="flex items-start gap-3 rounded-xl border border-[#1a1a1a] bg-[#080808] p-4">
            <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0 text-[#555]" />
            <div>
              <p className="text-sm font-black text-white">Purchase required to review</p>
              <p className="mt-1 text-xs text-[#666]">
                You can leave a review after your order for this jersey is delivered.
              </p>
              <Link
                to="/orders"
                className="mt-2 inline-block text-xs font-black text-[#FFD700] hover:underline"
              >
                View my orders →
              </Link>
            </div>
          </div>
        ) : canReview ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#555]">
                Your rating
              </p>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="mb-2 block text-xs font-black uppercase tracking-widest text-[#555]"
              >
                Your review
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts on fit, quality, and how it looks on match day…"
                rows={4}
                maxLength={500}
                className="w-full resize-none rounded-xl border border-[#1f1f1f] bg-black px-4 py-3 text-sm text-white placeholder-[#444] focus:border-[#FFD700]/50 focus:outline-none"
              />
              <p className="mt-1 text-right text-[10px] text-[#444]">
                {comment.length}/500 · min 10 characters
              </p>
            </div>

            {error && (
              <p className="text-sm font-semibold text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-black disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        ) : null}
      </div>

      {/* Reviews list */}
      {loadingReviews ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-[#1a1a1a] bg-[#080808]" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {reviews.map(r => (
            <ReviewCard key={r._id} review={r} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#1a1a1a] py-12 text-center">
          <Star className="mx-auto mb-3 h-8 w-8 text-[#333]" />
          <p className="text-sm font-black text-[#555]">No reviews yet</p>
          <p className="mt-1 text-xs text-[#444]">Be the first to review this jersey!</p>
        </div>
      )}
    </div>
  )
}
