'use client'

import { useEffect, useState } from 'react'
import { Check, Trash2, Loader2, Star } from 'lucide-react'
import AdminLayout from '../adminLayout/adminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { approveReview, deleteReview, fetchReviews } from '@/lib/services'
import type { Review } from '@/types'
import { toast } from 'sonner'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetchReviews()
      .then(setReviews)
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (id: string) => {
    try {
      await approveReview(id)
      toast.success('Review approved')
      load()
    } catch {
      toast.error('Approve failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return
    try {
      await deleteReview(id)
      toast.success('Review deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Reviews</h1>
        <p className="text-sm text-muted-foreground">Moderate customer jersey reviews</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${s <= review.rating ? 'fill-primary text-primary' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                  <Badge variant={review.isApproved ? 'success' : 'warning'}>
                    {review.isApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">&ldquo;{review.comment}&rdquo;</p>
                <p className="mb-4 text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('en-NP')}
                </p>
                <div className="flex gap-2">
                  {!review.isApproved && (
                    <Button size="sm" onClick={() => handleApprove(review._id)}>
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(review._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {reviews.length === 0 && (
            <p className="col-span-full py-12 text-center text-muted-foreground">No reviews yet</p>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
