'use client'

import { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs'
import RatingStars from './ratingStars'
import RatingModal from './ratingModals'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: {
    username: string | null
    email: string
  }
}

interface ReviewsListProps {
  raceId: number
  raceName: string
  reviews: Review[]
  averageRating: number
  onReviewAdded: () => void
}

export default function ReviewsList({ 
  raceId, 
  raceName, 
  reviews, 
  averageRating, 
  onReviewAdded 
}: ReviewsListProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const { user } = useUser()

  // Vérifier si l'utilisateur connecté a déjà une review
  const userReview = reviews.find(review => 
    user && (review.user.email === user.emailAddresses[0]?.emailAddress)
  )

  const submitReview = async (rating: number, comment: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raceId,
          rating,
          comment
        })
      })

      if (response.ok) {
        onReviewAdded()
        setModalOpen(false)
      }
    } catch (error) {
      console.error('Erreur soumission review:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Avis et notes</h3>
          {reviews.length > 0 && (
            <div className="flex items-center space-x-3">
              <RatingStars value={averageRating} readonly />
              <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-gray-600">({reviews.length} avis)</span>
            </div>
          )}
        </div>

        <SignedIn>
          <button
            onClick={() => setModalOpen(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              userReview
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {userReview ? '✏️ Modifier ma note' : '⭐ Noter ce GP'}
          </button>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
              Se connecter pour noter
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Liste des reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-600 mb-4">
            Aucun avis pour l'instant sur ce Grand Prix
          </p>
          <SignedIn>
            <p className="text-gray-500">Soyez le premier à donner votre avis !</p>
          </SignedIn>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">
                      {(review.user.username || review.user.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.user.username || review.user.email.split('@')[0]}
                    </p>
                    <div className="flex items-center space-x-2">
                      <RatingStars value={review.rating} readonly size="sm" />
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {review.comment && (
                <p className="text-gray-700 ml-11 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de notation */}
      <RatingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        raceName={raceName}
        raceId={raceId}
        onSubmit={submitReview}
      />
    </div>
  )
}