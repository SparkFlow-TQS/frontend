'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(formData)
      router.push('/')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.emailOrUsername.trim() && formData.password.trim()

  return (
    <div className="min-h-screen bg-[#14213D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="SparkFlow Logo" 
              width={64} 
              height={64}
              className="mr-3"
            />
            <h1 className="text-3xl font-bold text-[#FCA311]">SparkFlow</h1>
          </div>
          <p className="text-white/80">Sign in to your account</p>
        </div>

        <Card className="bg-white/10 border-[#FCA311]/20">
          <CardHeader>
            <CardTitle className="text-[#FCA311] text-center">Welcome Back</CardTitle>
            <CardDescription className="text-white/70 text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="emailOrUsername" className="text-white">
                  Email or Username
                </Label>
                <Input
                  id="emailOrUsername"
                  name="emailOrUsername"
                  type="text"
                  value={formData.emailOrUsername}
                  onChange={handleInputChange}
                  placeholder="Enter your email or username"
                  className="bg-white/10 border-[#FCA311]/30 text-white placeholder:text-white/50"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="bg-white/10 border-[#FCA311]/30 text-white placeholder:text-white/50"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#14213D] font-semibold"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/70">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/auth/register" 
                  className="text-[#FCA311] hover:text-[#FCA311]/80 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link 
                href="/" 
                className="text-white/50 hover:text-white/70 text-sm"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Role information */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-sm">
            Regular users can schedule and view charging sessions.<br/>
            Operators have additional administrative privileges.
          </p>
        </div>
      </div>
    </div>
  )
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'