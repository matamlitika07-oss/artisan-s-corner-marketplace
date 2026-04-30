'use client'

import { useState, useEffect } from 'react'
import { Star, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import type { Review, Profile } from '@/lib/types'

interface ProductReviewsProps {
  productId: string
  initialReviews: (Review & { buyer: Pick<Profile, 'name'> | null })[]
}

export function ProductReviews({ productId, initialReviews }: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [hasReviewed, setHasReviewed] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
        
        // Check if user has already reviewed
        const existingReview = initialReviews.find(
          (r) => r.buyer_id === user.id
        )
        setHasReviewed(!!existingReview)
      }
    }
    getProfile()
  }, [supabase, initialReviews])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError('')

    const { data, error: submitError } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        buyer_id: profile.id,
        rating,
        comment: comment.trim() || null,
      })
      .select('*, buyer:profiles(name)')
      .single()

    if (submitError) {
      setError(submitError.message)
      setIsSubmitting(false)
      return
    }

    setReviews([data, ...reviews])
    setRating(0)
    setComment('')
    setHasReviewed(true)
    setIsSubmitting(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Review Form */}
      {profile && !hasReviewed && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Rating Stars */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Your Rating
                </label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i + 1)}
                      onMouseEnter={() => setHoverRating(i + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          i < (hoverRating || rating)
                            ? 'fill-accent text-accent'
                            : 'fill-muted text-muted-foreground'
                        }`}
                      />
                      <span className="sr-only">{i + 1} stars</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="mb-2 block text-sm font-medium">
                  Your Review (optional)
                </label>
                <Textarea
                  id="comment"
                  placeholder="Share your thoughts about this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!profile && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              <a href="/auth/login" className="text-primary hover:underline">
                Sign in
              </a>{' '}
              to write a review
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {review.buyer?.name || 'Anonymous'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-accent text-accent'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  )
}
