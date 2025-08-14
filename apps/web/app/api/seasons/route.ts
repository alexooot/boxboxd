import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Pour l'instant, on a que 2024, mais on prépare pour plusieurs saisons
    const seasons = await prisma.race2024.groupBy({
      by: ['season'],
      _count: {
        raceId: true
      },
      orderBy: {
        season: 'desc'
      }
    })

    // Enrichir avec des stats
    const seasonsWithStats = await Promise.all(
      seasons.map(async (season) => {
        const races = await prisma.race2024.findMany({
          where: { season: season.season },
          include: {
            circuit: true,
            results: {
              take: 1,
              orderBy: { position: 'asc' },
              include: {
                driver: true,
                constructor: true
              }
            },
            _count: {
              select: { reviews: true }
            }
          },
          orderBy: { round: 'asc' }
        })

        // Champion de la saison (le plus de victoires)
        const winners = races.map(race => race.results[0]?.driver).filter(Boolean)
        const winCounts = winners.reduce((acc: any, driver) => {
          if (driver) {
            const name = `${driver.givenName} ${driver.familyName}`
            acc[name] = (acc[name] || 0) + 1
          }
          return acc
        }, {})

        const champion = Object.entries(winCounts).reduce((a: any, b: any) => 
          winCounts[a[0]] > winCounts[b[0]] ? a : b
        )?.[0] || null

        return {
          year: season.season,
          raceCount: season._count.raceId,
          totalReviews: races.reduce((sum, race) => sum + race._count.reviews, 0),
          champion,
          firstRace: races[0],
          lastRace: races[races.length - 1]
        }
      })
    )

    return NextResponse.json(seasonsWithStats)
  } catch (error) {
    console.error('Error fetching seasons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    )
  }
}