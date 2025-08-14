import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  console.log('🎯 Webhook Clerk reçu')
  
  try {
    const body = await req.text()
    const headerPayload = await headers()  // ← Await ajouté ici
    
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('❌ Headers manquants')
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 })
    }

    if (!webhookSecret) {
      console.error('❌ CLERK_WEBHOOK_SECRET manquant')
      return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 })
    }

    const wh = new Webhook(webhookSecret)
    let evt: any

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      })
    } catch (error) {
      console.error('❌ Erreur vérification signature:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const eventType = evt.type
    console.log(`📩 Event type: ${eventType}`)

    if (eventType === 'user.created') {
      const { id, email_addresses, username, first_name, last_name } = evt.data
      
      console.log('👤 Création utilisateur:', { id, username })
      
      await prisma.user.create({
        data: {
          clerkUserId: id,
          email: email_addresses[0]?.email_address || '',
          username: username || `${first_name || ''}_${last_name || ''}`.trim() || null,
        },
      })
      
      console.log('✅ Utilisateur créé en DB')
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, username, first_name, last_name } = evt.data
      
      console.log('🔄 Mise à jour utilisateur:', { id, username })
      
      await prisma.user.upsert({
        where: { clerkUserId: id },
        update: {
          email: email_addresses[0]?.email_address || '',
          username: username || `${first_name || ''}_${last_name || ''}`.trim() || null,
        },
        create: {
          clerkUserId: id,
          email: email_addresses[0]?.email_address || '',
          username: username || `${first_name || ''}_${last_name || ''}`.trim() || null,
        }
      })
      
      console.log('✅ Utilisateur mis à jour en DB')
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data
      
      console.log('🗑️ Suppression utilisateur:', { id })
      
      await prisma.user.delete({
        where: { clerkUserId: id },
      })
      
      console.log('✅ Utilisateur supprimé de DB')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('💥 Erreur webhook:', error)
    return NextResponse.json({ 
      error: 'Webhook failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}