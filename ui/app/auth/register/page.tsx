'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register, isAuthenticated } = useAuth()
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

  const validateForm = () => {
    if (!formData.username.trim()) {
      return 'Username is required'
    }
    if (formData.username.length < 3) {
      return 'Username must be at least 3 characters long'
    }
    if (!formData.email.trim()) {
      return 'Email is required'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address'
    }
    if (!formData.password) {
      return 'Password is required'
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.username.trim() && 
                     formData.email.trim() && 
                     formData.password && 
                     formData.confirmPassword

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
          <p className="text-white/80">Create your account</p>
        </div>

        <Card className="bg-white/10 border-[#FCA311]/20">
          <CardHeader>
            <CardTitle className="text-[#FCA311] text-center">Join SparkFlow</CardTitle>
            <CardDescription className="text-white/70 text-center">
              Sign up to start managing your EV charging
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
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className="bg-white/10 border-[#FCA311]/30 text-white placeholder:text-white/50"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
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
                  placeholder="Create a password"
                  className="bg-white/10 border-[#FCA311]/30 text-white placeholder:text-white/50"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/70">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-[#FCA311] hover:text-[#FCA311]/80 font-medium"
                >
                  Sign in
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

        {/* Information about account types */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-sm">
            New accounts are created as regular users.<br/>
            Contact an administrator for operator privileges.
          </p>
        </div>
      </div>
    </div>
  )
}