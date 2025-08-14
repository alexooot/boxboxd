// apps/web/app/api/races/route.ts (App Router)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Utilisation de vos modèles Prisma existants
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
    });

    // Transformation des données pour correspondre à votre interface frontend
    const transformedRaces = races.map(race => ({
      raceid: race.raceId,
      year: race.season,
      round: race.round,
      race_name: race.raceName,
      date: race.date.toISOString().split('T')[0], // Format YYYY-MM-DD
      time: race.time ? race.time.toISOString() : null,
      race_url: race.url,
      circuitid: race.circuitId,
      circuit_name: race.circuit.circuitName,
      location: race.circuit.locality,
      country: race.circuit.country,
      lat: race.circuit.lat,
      lng: race.circuit.long,
      circuit_url: race.circuit.url,
      reviews_count: race._count.reviews
    }));

    return Response.json({
      success: true,
      data: transformedRaces
    });

  } catch (error) {
    console.error('Erreur Prisma:', error);
    return Response.json({
      success: false,
      error: 'Erreur lors de la récupération des données',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Si vous utilisez Pages Router, créez apps/web/pages/api/races.ts :
/*
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
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
      });

      const transformedRaces = races.map(race => ({
        raceid: race.raceId,
        year: race.season,
        round: race.round,
        race_name: race.raceName,
        date: race.date.toISOString().split('T')[0],
        time: race.time ? race.time.toISOString() : null,
        race_url: race.url,
        circuitid: race.circuitId,
        circuit_name: race.circuit.circuitName,
        location: race.circuit.locality,
        country: race.circuit.country,
        lat: race.circuit.lat,
        lng: race.circuit.long,
        circuit_url: race.circuit.url,
        reviews_count: race._count.reviews
      }));

      res.status(200).json({
        success: true,
        data: transformedRaces
      });

    } catch (error) {
      console.error('Erreur Prisma:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des données'
      });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ 
      success: false,
      error: 'Méthode non autorisée' 
    });
  }
}
*/