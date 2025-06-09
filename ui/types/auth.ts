/**
 * Authentication-related type definitions
 */

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
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface User {
  id: string
  username: string
  email: string
  isOperator: boolean
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}