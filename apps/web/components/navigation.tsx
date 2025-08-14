'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-red-600">🏎️ BoxBoxD</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/"
              className={`px-3 py-2 rounded-lg transition-colors ${
                pathname === '/' 
                  ? 'bg-red-100 text-red-700 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Accueil
            </Link>
            
            <Link 
  href="/seasons"
  className={`px-3 py-2 rounded-lg transition-colors ${
    isActive('/seasons') 
      ? 'bg-red-100 text-red-700 font-medium' 
      : 'text-gray-600 hover:text-gray-900'
  }`}
>
  Grands Prix
</Link>
            
            <SignedIn>
              <Link 
                href="/profile"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive('/profile') 
                    ? 'bg-red-100 text-red-700 font-medium' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mon Profil
              </Link>
            </SignedIn>
          </nav>

          {/* Auth */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Se connecter
                </button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  )
}