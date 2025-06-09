'use client'

import React from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOperator?: boolean
  fallbackPath?: string
}

export default function ProtectedRoute({ 
  children, 
  requireOperator = false,
  fallbackPath = '/auth/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, isOperator } = useAuth()
  const router = useRouter()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#14213D] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCA311] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push(fallbackPath)
    }
    return (
      <div className="min-h-screen bg-[#14213D] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#FCA311] mb-4">Authentication Required</h2>
          <p className="text-white mb-6">Please sign in to access this page.</p>
          <Link 
            href="/auth/login"
            className="bg-[#FCA311] text-[#14213D] px-6 py-3 rounded font-semibold hover:bg-[#FCA311]/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Check operator privileges if required
  if (requireOperator && !isOperator()) {
    return (
      <div className="min-h-screen bg-[#14213D] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-white mb-6">
            This page requires operator privileges.
          </p>
          <p className="text-white/70 mb-6">
            Current user: <span className="font-semibold">{user?.username}</span> (Regular User)
          </p>
          <div className="space-x-4">
            <Link 
              href="/"
              className="bg-[#FCA311] text-[#14213D] px-6 py-3 rounded font-semibold hover:bg-[#FCA311]/90 transition-colors"
            >
              Go Home
            </Link>
            <Link 
              href="/dashboard"
              className="bg-white/10 text-white px-6 py-3 rounded font-semibold hover:bg-white/20 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Render protected content
  return <>{children}</>
}