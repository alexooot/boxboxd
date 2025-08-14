import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-2">🏎️ BoxBoxD</h1>
          <p className="text-gray-600">Connectez-vous pour noter les GP</p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}