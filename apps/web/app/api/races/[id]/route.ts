import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raceId = parseInt(params.id)

    if (isNaN(raceId)) {
      return NextResponse.json({ error: 'Invalid race ID' }, { status: 400 })
    }

    const race = await prisma.race2024.findUnique({
      where: { raceId },
      include: {
        circuit: true,
        results: {
          orderBy: { position: 'asc' },
          include: {
            driver: true,
            constructor: true
          }
        },
        qualifyingResults: {
          orderBy: { position: 'asc' },
          include: {
            driver: true,
            constructor: true
          }
        },
        sprintResults: {
          orderBy: { position: 'asc' },
          include: {
            driver: true,
            constructor: true
          }
        },
        reviews: {
          include: {
            user: {
              select: { username: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!race) {
      return NextResponse.json({ error: 'Race not found' }, { status: 404 })
    }

    const averageRating = race.reviews.length > 0 
      ? race.reviews.reduce((sum, review) => sum + review.rating, 0) / race.reviews.length
      : 0

    return NextResponse.json({
      ...race,
      averageRating
    })
  } catch (error) {
    console.error('Error fetching race:', error)
    return NextResponse.json(
      { error: 'Failed to fetch race' },
      { status: 500 }
    )
  }
}