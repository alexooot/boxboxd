import { SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  // Quelques GP récents pour l'aperçu
  const recentRaces = await prisma.race2024.findMany({
    take: 6,
    include: {
      circuit: true,
      results: {
        take: 1,
        orderBy: { position: 'asc' },
        include: {
          driver: true,
          constructor: true
        }
      }
    },
    orderBy: { round: 'desc' }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenue sur BoxBoxD
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Le Letterboxd de la Formule 1 - Notez et commentez tous les Grands Prix
        </p>
        
        <SignedOut>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-blue-800 mb-4">
              Créez votre compte pour commencer à noter les Grands Prix !
            </p>
          </div>
        </SignedOut>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link 
          href="/seasons/2024"
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center"
        >
          <div className="text-3xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold mb-2">Saison 2024</h3>
          <p className="text-gray-600">Découvrez tous les GP de la saison en cours</p>
        </Link>

        <Link 
          href="/seasons"
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center"
        >
          <div className="text-3xl mb-4">📅</div>
          <h3 className="text-xl font-semibold mb-2">Toutes les saisons</h3>
          <p className="text-gray-600">Explorez l'historique des Grands Prix</p>
        </Link>
      </div>

      {/* Recent Races Preview */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Derniers Grands Prix</h2>
          <Link 
            href="/seasons/2024"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Voir tous les GP 2024 →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentRaces.map((race) => (
            <Link
              key={race.raceId}
              href={`/seasons/${race.season}/races/${race.raceId}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-1">{race.raceName}</h3>
                <p className="text-gray-600 text-sm">{race.circuit.circuitName}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(race.date).toLocaleDateString('fr-FR')} • Round {race.round}
                </p>
              </div>
              
              {race.results[0] && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-yellow-800">🏆 Vainqueur</p>
                  <p className="text-sm font-semibold">
                    {race.results[0].driver.givenName} {race.results[0].driver.familyName}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      <SignedIn>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800">
            ✅ Vous êtes connecté ! Explorez les saisons et notez vos GP favoris.
          </p>
        </div>
      </SignedIn>
    </div>
  )
}