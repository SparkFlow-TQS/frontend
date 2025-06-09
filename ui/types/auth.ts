/**
 * Authentication-related type definitions
 */

export interface User {
  id: string
  username: string
  email: string
  operator: boolean
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  emailOrUsername: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  isOperator: () => boolean
}

export interface AuthError {
  message: string
  status?: number
  field?: string
}

export interface TokenData {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'