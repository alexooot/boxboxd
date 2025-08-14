'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentSeason } from '@/lib/seasons'

export default function SeasonsIndexPage() {
  const router = useRouter()

  useEffect(() => {
    const currentSeason = getCurrentSeason()
    router.replace(`/seasons/${currentSeason.year}`)
  }, [router])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers la saison actuelle...</p>
      </div>
    </div>
  )
}