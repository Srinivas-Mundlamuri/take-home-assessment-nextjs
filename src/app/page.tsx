'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        
        if (data.user) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Session check failed:', error)
        router.push('/login')
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Project Manager
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Collaborative project management with integrated whiteboarding
        </p>
        <div className="text-gray-500">
          Redirecting...
        </div>
      </div>
    </div>
  )
}
