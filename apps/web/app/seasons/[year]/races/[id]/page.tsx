'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ResultsTable from '@/components/resultTable'
import ReviewsList from '@/components/reviewList'

interface Race {
  raceId: number
  raceName: string
  date: string
  time: string | null
  round: number
  season: number
  url: string | null
  circuit: {
    circuitName: string
    country: string
    locality: string | null
    lat: number | null
    long: number | null
    url: string | null
  }
  results: any[]
  qualifyingResults: any[]
  sprintResults: any[]
  reviews: any[]
  averageRating: number
}

export default function RaceDetailPage() {
  const params = useParams()
  const [race, setRace] = useState<Race | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<'race' | 'qualifying' | 'sprint'>('race')

  const year = params.year as string
  const raceId = parseInt(params.id as string)

  const loadRace = async () => {
    try {
      const response = await fetch(`/api/races/${raceId}`)
      if (response.ok) {
        const data = await response.json()
        setRace(data)
      } else {
        setError(true)
      }
    } catch (error) {
      console.error('Erreur chargement course:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (raceId) {
      loadRace()
    }
  }, [raceId])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du Grand Prix...</p>
        </div>
      </div>
    )
  }

  if (error || !race) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Grand Prix non trouvé</h1>
          <Link href={`/seasons/${year}`} className="text-red-600 hover:text-red-700">
            ← Retour à la saison {year}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Accueil</Link>
          <span>→</span>
          <Link href="/seasons" className="hover:text-gray-900">Saisons</Link>
          <span>→</span>
          <Link href={`/seasons/${year}`} className="hover:text-gray-900">{year}</Link>
          <span>→</span>
          <span className="text-gray-900">{race.raceName}</span>
        </div>
      </nav>

      {/* Header du GP */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                Round {race.round} • {race.season}
              </span>
              {race.averageRating > 0 && (
                <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                  ⭐ {race.averageRating.toFixed(1)}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{race.raceName}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="space-y-2">
                <p><span className="font-medium">📍 Circuit:</span> {race.circuit.circuitName}</p>
                <p><span className="font-medium">🌍 Pays:</span> {race.circuit.country}</p>
                {race.circuit.locality && (
                  <p><span className="font-medium">🏙️ Ville:</span> {race.circuit.locality}</p>
                )}
              </div>
              <div className="space-y-2">
                <p><span className="font-medium">📅 Date:</span> {new Date(race.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                {race.time && (
                  <p><span className="font-medium">⏰ Heure:</span> {race.time}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vainqueur */}
          {race.results[0] && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6 text-center min-w-[250px]">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-yellow-900 font-medium mb-1">Vainqueur</p>
              <p className="text-xl font-bold text-yellow-900">
                {race.results[0].driver.givenName} {race.results[0].driver.familyName}
              </p>
              <p className="text-yellow-800">{race.results[0].constructor.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation entre GP */}
      <div className="flex justify-between items-center mb-8">
        <Link 
          href={`/seasons/${year}`}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
        >
          ← Tous les GP {year}
        </Link>
        
        <div className="text-sm text-gray-600">
          Grand Prix #{race.round}
        </div>
      </div>

      {/* Onglets des résultats */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('race')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'race'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Résultats de course ({race.results.length})
            </button>
            
            {race.qualifyingResults && race.qualifyingResults.length > 0 && (
              <button
                onClick={() => setActiveTab('qualifying')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'qualifying'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Qualifications ({race.qualifyingResults.length})
              </button>
            )}

            {race.sprintResults && race.sprintResults.length > 0 && (
              <button
                onClick={() => setActiveTab('sprint')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sprint'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sprint ({race.sprintResults.length})
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="mb-8">
        {activeTab === 'race' && race.results && (
          <ResultsTable results={race.results} type="race" />
        )}
        {activeTab === 'qualifying' && race.qualifyingResults && race.qualifyingResults.length > 0 && (
          <ResultsTable results={race.qualifyingResults} type="qualifying" />
        )}
        {activeTab === 'sprint' && race.sprintResults && race.sprintResults.length > 0 && (
          <ResultsTable results={race.sprintResults} type="sprint" />
        )}
      </div>

      {/* Section Reviews */}
      <ReviewsList
        raceId={race.raceId}
        raceName={race.raceName}
        reviews={race.reviews}
        averageRating={race.averageRating}
        onReviewAdded={loadRace}
      />
    </div>
  )
}