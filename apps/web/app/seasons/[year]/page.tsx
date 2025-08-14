'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import RatingStars from '@/components/ratingStars'
import { SEASONS, getCurrentSeason, getSeason } from '@/lib/seasons'

interface Race {
  raceId: number
  raceName: string
  date: string
  round: number
  circuit: {
    circuitName: string
    country: string
  }
  results: Array<{
    driver: {
      givenName: string
      familyName: string
    }
    constructor: {
      name: string
    }
  }>
  _count: {
    reviews: number
  }
  averageRating?: number
}

export default function SeasonPage() {
  const params = useParams()
  const router = useRouter()
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  
  const selectedYear = parseInt(params.year as string)
  const selectedSeason = getSeason(selectedYear)
  const currentSeason = getCurrentSeason()

  useEffect(() => {
    if (selectedSeason?.available && selectedYear) {
      setLoading(true)
      fetch(`/api/races?season=${selectedYear}`)
        .then(res => res.json())
        .then(data => {
          setRaces(data)
          setLoading(false)
        })
        .catch(error => {
          console.error('Erreur:', error)
          setLoading(false)
        })
    } else {
      setRaces([])
      setLoading(false)
    }
  }, [selectedYear, selectedSeason])

  const handleSeasonChange = (year: number) => {
    router.push(`/seasons/${year}`)
  }

  if (!selectedSeason) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Saison non trouvée</h1>
          <Link href={`/seasons/${currentSeason.year}`} className="text-red-600 hover:text-red-700">
            ← Retour à la saison actuelle
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Accueil</Link>
          <span>→</span>
          <Link href="/seasons" className="hover:text-gray-900">Saisons</Link>
          <span>→</span>
          <span className="text-gray-900">{selectedYear}</span>
        </div>
      </nav>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Saison {selectedYear}
            </h1>
            <p className="text-gray-600">
              Tous les Grands Prix de la saison
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">
              Changer de saison :
            </label>
            <select
              value={selectedYear}
              onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
            >
              {SEASONS.map(season => (
                <option 
                  key={season.year} 
                  value={season.year}
                  disabled={!season.available}
                >
                  {season.year} {!season.available && '(bientôt)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des Grands Prix...</p>
        </div>
      ) : races.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Aucun Grand Prix trouvé pour cette saison.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {races.map((race) => (
            <Link
              key={race.raceId}
              href={`/seasons/${selectedYear}/races/${race.raceId}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{race.raceName}</h3>
                  <p className="text-gray-600">{race.circuit.circuitName}</p>
                  <p className="text-sm text-gray-500">
                    Round {race.round} • {new Date(race.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-center">
                  {race._count.reviews > 0 ? (
                    <>
                      <RatingStars value={race.averageRating || 0} readonly size="sm" />
                      <p className="text-sm text-gray-600">{race._count.reviews} avis</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Pas encore noté</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}