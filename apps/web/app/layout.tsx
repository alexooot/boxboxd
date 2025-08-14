import { ClerkProvider } from '@clerk/nextjs'
import Navigation from '@/components/navigation'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BoxBoxD - F1 Reviews',
  description: 'Letterboxd pour les Grands Prix de Formule 1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body className="bg-gray-50 text-gray-900">
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}