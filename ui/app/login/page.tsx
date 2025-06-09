"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaBolt, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { LoginRequest } from '@/types/auth'

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginRequest>({
    emailOrUsername: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: keyof LoginRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(formData)
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.emailOrUsername.trim() && formData.password.trim()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14213d] to-[#1a2f5e] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFA500] rounded-full mb-4">
            <FaBolt className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">SparkFlow</h1>
          <p className="text-gray-300 mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-xl text-center">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername" className="text-white">
                  Email or Username
                </Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Enter your email or username"
                  value={formData.emailOrUsername}
                  onChange={handleInputChange('emailOrUsername')}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#FFA500] hover:bg-[#FFA500]/90 text-black font-semibold"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300 text-sm">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-[#FFA500] hover:text-[#FFA500]/80 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <div className="text-center text-xs text-gray-400">
          <p>Demo credentials: user@example.com / password123</p>
        </div>
      </div>
    </div>
  )
}