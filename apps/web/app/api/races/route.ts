// apps/web/app/api/races/route.ts
import { prisma } from '@/lib/prisma' // ← Utilisez le singleton
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API /races appelée')
    
    // Vérifier la connexion DB
    await prisma.$connect()
    console.log('✅ Connexion DB établie')

    const races = await prisma.race2024.findMany({
      include: {
        circuit: true,
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: {
        round: 'asc'
      }
    })

    console.log(`📊 ${races.length} courses trouvées`)

    // Calculer la note moyenne pour chaque course
    const racesWithRatings = await Promise.all(
      races.map(async (race) => {
        const reviews = await prisma.review.findMany({
          where: { raceId: race.raceId }
        })
        
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0

        return {
          raceId: race.raceId,
          season: race.season,
          round: race.round,
          raceName: race.raceName,
          date: race.date.toISOString().split('T')[0],
          time: race.time ? race.time.toISOString() : null,
          url: race.url,
          circuitId: race.circuitId,
          circuit: {
            circuitName: race.circuit.circuitName,
            country: race.circuit.country,
            locality: race.circuit.locality,
            lat: race.circuit.lat,
            long: race.circuit.long,
            url: race.circuit.url
          },
          _count: race._count,
          averageRating
        }
      })
    )

    return NextResponse.json(racesWithRatings)

  } catch (error) {
    console.error('❌ Erreur API /races:', error)
    
    // Plus de détails sur l'erreur
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des données',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}