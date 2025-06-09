/**
 * Authentication-related type definitions
 */

export interface User {
  id: string
  username: string
  email: string
  isOperator: boolean
  operator?: boolean // For backward compatibility
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
  operator: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  username: string
  email: string
  isOperator: boolean
  user?: User // For backward compatibility
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
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
