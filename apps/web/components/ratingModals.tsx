'use client'

import { useState } from 'react'
import RatingStars from './ratingStars'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  raceName: string
  raceId: number
  onSubmit: (rating: number, comment: string) => void
}

export default function RatingModal({ 
  isOpen, 
  onClose, 
  raceName, 
  raceId, 
  onSubmit 
}: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return

    setLoading(true)
    try {
      await onSubmit(rating, comment)
      onClose()
      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Noter ce Grand Prix</h2>
        <h3 className="text-lg text-gray-700 mb-6">{raceName}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (obligatoire)
            </label>
            <RatingStars value={rating} onChange={setRating} size="lg" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
              placeholder="Votre avis sur ce Grand Prix..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={rating === 0 || loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'En cours...' : 'Noter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}