"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FaBolt, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { RegisterRequest } from '@/types/auth'

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    operator: false,
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: keyof RegisterRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'operator' ? e.target.checked : e.target.value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      await register(formData)
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = 
    formData.username.trim() && 
    formData.email.trim() && 
    formData.password.trim() && 
    confirmPassword.trim() &&
    formData.password === confirmPassword

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14213d] to-[#1a2f5e] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFA500] rounded-full mb-4">
            <FaBolt className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">SparkFlow</h1>
          <p className="text-gray-300 mt-2">Create your account</p>
        </div>

        {/* Registration Form */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-xl text-center">Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
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
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
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
                    placeholder="Create a password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (error) setError(null)
                    }}
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 pr-10"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="operator"
                  checked={formData.operator}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, operator: !!checked }))
                  }
                  className="data-[state=checked]:bg-[#FFA500] data-[state=checked]:border-[#FFA500]"
                  disabled={isLoading}
                />
                <Label htmlFor="operator" className="text-white text-sm">
                  Register as station operator
                </Label>
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300 text-sm">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-[#FFA500] hover:text-[#FFA500]/80 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}