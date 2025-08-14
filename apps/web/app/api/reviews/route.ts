import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer ou créer l'utilisateur dans notre DB
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id }
    })

    // Si l'utilisateur n'existe pas, le créer automatiquement
    if (!dbUser) {
      console.log('🔄 Utilisateur non trouvé en DB, création automatique:', user.id)
      
      dbUser = await prisma.user.create({
        data: {
          clerkUserId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          username: user.username || user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || null,
        },
      })
      
      console.log('✅ Utilisateur créé automatiquement:', dbUser)
    }

    const { raceId, rating, comment } = await req.json()

    console.log('📝 Tentative création review:', { userId: dbUser.id, raceId, rating })

    // Créer ou mettre à jour la review
    const review = await prisma.review.upsert({
      where: {
        userId_raceId: {
          userId: dbUser.id,
          raceId: parseInt(raceId)
        }
      },
      update: {
        rating,
        comment: comment || null,
      },
      create: {
        userId: dbUser.id,
        raceId: parseInt(raceId),
        rating,
        comment: comment || null,
      }
    })

    console.log('✅ Review créée/mise à jour:', review)

    return NextResponse.json(review)
  } catch (error) {
    console.error('❌ Erreur création review:', error)
    return NextResponse.json({ 
      error: 'Failed to create review',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const raceId = url.searchParams.get('raceId')

    if (!raceId) {
      return NextResponse.json({ error: 'Race ID required' }, { status: 400 })
    }

    const reviews = await prisma.review.findMany({
      where: { raceId: parseInt(raceId) },
      include: {
        user: {
          select: { username: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}