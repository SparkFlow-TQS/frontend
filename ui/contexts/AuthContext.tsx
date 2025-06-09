"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthAPI } from '@/lib/auth'
import { LoginRequest, RegisterRequest, User, AuthContextType } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const storedUser = AuthAPI.getStoredUser()
      const token = AuthAPI.getStoredToken()
      
      if (storedUser && token) {
        // Check if token is valid and refresh if needed
        const tokenIsValid = await AuthAPI.refreshTokenIfNeeded()
        
        if (tokenIsValid) {
          setUser(storedUser)
        } else {
          AuthAPI.clearTokens()
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      AuthAPI.clearTokens()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      const authResponse = await AuthAPI.login(credentials)
      
      AuthAPI.setTokens(authResponse)
      
      const user: User = {
        id: '', // Will be updated when we have proper user endpoint
        username: authResponse.username,
        email: authResponse.email,
        isOperator: authResponse.isOperator,
      }
      
      setUser(user)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true)
      await AuthAPI.register(userData)
      
      // After successful registration, log the user in
      await login({
        emailOrUsername: userData.email,
        password: userData.password,
      })
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    AuthAPI.clearTokens()
    setUser(null)
  }

  const refreshToken = async () => {
    try {
      const refreshToken = AuthAPI.getStoredRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const authResponse = await AuthAPI.refreshToken({ refreshToken })
      AuthAPI.setTokens(authResponse)
      
      const updatedUser: User = {
        id: user?.id ?? '',
        username: authResponse.username,
        email: authResponse.email,
        isOperator: authResponse.isOperator,
      }
      
      setUser(updatedUser)
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}