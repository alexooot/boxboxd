'use client'

import { useEffect, useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

interface Race {
  raceId: number
  raceName: string
  date: string
  round: number
  circuit: {
    circuitName: string
    country: string
  }
  _count: {
    reviews: number
  }
  averageRating?: number
}

export default function Home() {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbStatus, setDbStatus] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Chargement des données...')
        
        // Test de connexion DB d'abord
        const dbTest = await fetch('/api/test-db')
        const dbData = await dbTest.json()
        setDbStatus(dbData)
        
        if (!dbTest.ok) {
          throw new Error(`DB Error: ${dbData.error}`)
        }
        
        console.log('✅ DB Status:', dbData)
        
        // Puis charger les courses
        const racesResponse = await fetch('/api/races')
        const racesData = await racesResponse.json()
        
        if (!racesResponse.ok) {
          throw new Error(`API Error: ${racesData.error || 'Erreur inconnue'}`)
        }
        
        console.log('✅ Courses chargées:', racesData.length)
        setRaces(Array.isArray(racesData) ? racesData.slice(0, 6) : [])
        
      } catch (error) {
        console.error('❌ Erreur chargement:', error)
        setError(error instanceof Error ? error.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-red-600">🏎️ BoxBoxD</h1>
              <p className="text-gray-600">F1 Reviews & Ratings - Saison 2024</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Se connecter
                  </button>
                </SignInButton>
              </SignedOut>
              
              <SignedIn>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur BoxBoxD
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Le Letterboxd de la Formule 1 - Notez et commentez tous les Grands Prix
          </p>
        </div>

        {/* Debug info en développement */}
        {process.env.NODE_ENV === 'development' && dbStatus && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Debug Info:</h3>
            <pre className="text-sm text-blue-700">
              {JSON.stringify(dbStatus, null, 2)}
            </pre>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des Grands Prix...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">
              Erreur de connexion
            </h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : races.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucune donnée trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              La base de données semble vide. Vérifiez l'import des données.
            </p>
            <Link
              href="/seasons/2024"
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Explorer les saisons
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {races.map((race) => (
              <Link
                key={race.raceId}
                href={`/seasons/2024/races/${race.raceId}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <h3 className="text-xl font-semibold mb-2">{race.raceName}</h3>
                <p className="text-gray-600">{race.circuit.circuitName}</p>
                <p className="text-sm text-gray-500">
                  Round {race.round} • {new Date(race.date).toLocaleDateString('fr-FR')}
                </p>
                {race._count.reviews > 0 && (
                  <p className="text-sm text-yellow-600 mt-2">
                    ⭐ {race.averageRating?.toFixed(1) || 'N/A'} ({race._count.reviews} avis)
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}