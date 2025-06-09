/**
 * Authentication API and utilities
 */

import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest, User } from '@/types/auth'

const USER_SERVICE_BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8081'
const TOKEN_STORAGE_KEY = 'sparkflow_access_token'
const REFRESH_TOKEN_STORAGE_KEY = 'sparkflow_refresh_token'
const USER_STORAGE_KEY = 'sparkflow_user'

class AuthAPI {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${USER_SERVICE_BASE_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return response.json()
      }
      
      return response.text() as T
    } catch (error) {
      console.error(`Auth API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  static async register(userData: RegisterRequest): Promise<User> {
    return this.makeRequest<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  static async refreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(refreshTokenRequest),
    })
  }

  static async getCurrentUser(): Promise<User> {
    const token = this.getStoredToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.makeRequest<User>('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Token management utilities
  static getStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  }

  static getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
  }

  static getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    const userJson = localStorage.getItem(USER_STORAGE_KEY)
    return userJson ? JSON.parse(userJson) : null
  }

  static setTokens(authResponse: AuthResponse): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(TOKEN_STORAGE_KEY, authResponse.accessToken)
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, authResponse.refreshToken)
    
    const user: User = {
      id: '', // Will be filled when we get user details
      username: authResponse.username,
      email: authResponse.email,
      isOperator: authResponse.isOperator,
    }
    
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  static async refreshTokenIfNeeded(): Promise<boolean> {
    const token = this.getStoredToken()
    const refreshToken = this.getStoredRefreshToken()
    
    if (!token || !refreshToken) {
      return false
    }
    
    if (!this.isTokenExpired(token)) {
      return true
    }
    
    try {
      const authResponse = await this.refreshToken({ refreshToken })
      this.setTokens(authResponse)
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearTokens()
      return false
    }
  }
}

export { AuthAPI }