import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const season = url.searchParams.get('season')

    const races = await prisma.race2024.findMany({
      where: season ? { season: parseInt(season) } : undefined,
      include: {
        circuit: true,
        results: {
          take: 3,
          orderBy: { position: 'asc' },
          include: {
            driver: true,
            constructor: true
          }
        },
        _count: {
          select: { reviews: true }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { round: 'asc' }
    })

    // Calculer la moyenne des ratings pour chaque course
    const racesWithAverage = races.map(race => ({
      ...race,
      averageRating: race.reviews.length > 0 
        ? race.reviews.reduce((sum, review) => sum + review.rating, 0) / race.reviews.length
        : 0
    }))
    
    return NextResponse.json(racesWithAverage)
  } catch (error) {
    console.error('Error fetching races:', error)
    return NextResponse.json(
      { error: 'Failed to fetch races' },
      { status: 500 }
    )
  }
}