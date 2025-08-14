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
  results: Array<{
    driver: {
      givenName: string
      familyName: string
    }
    constructor: {
      name: string
    }
  }>
}

export default function Home() {
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger les données côté client seulement
    fetch('/api/races')
      .then(res => res.json())
      .then(data => {
        setRaces(Array.isArray(data) ? data.slice(0, 6) : [])
        setLoading(false)
      })
      .catch(error => {
        console.error('Erreur chargement courses:', error)
        setLoading(false)
      })
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

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des Grands Prix...</p>
          </div>
        ) : races.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏗️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Base de données en cours de configuration
            </h3>
            <p className="text-gray-600 mb-6">
              Les données F1 seront bientôt disponibles !
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
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}