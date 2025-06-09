"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOperator?: boolean
}

export default function ProtectedRoute({ children, requireOperator = false }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      if (requireOperator && user && !user.isOperator) {
        router.push('/dashboard') // Redirect non-operators to dashboard
        return
      }
    }
  }, [isAuthenticated, isLoading, requireOperator, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#14213d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFA500] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  if (requireOperator && user && !user.isOperator) {
    return null // Will redirect to dashboard
  }


  return <>{children}</>
}