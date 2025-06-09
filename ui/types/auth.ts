/**
 * Authentication-related type definitions
 */

<<<<<<< HEAD
export interface User {
  id: string
  username: string
  email: string
  operator: boolean
  createdAt?: string
  updatedAt?: string
}

=======
>>>>>>> 423cc15 (feat: implement complete authentication system)
export interface LoginRequest {
  emailOrUsername: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
<<<<<<< HEAD
=======
  operator: boolean
>>>>>>> 423cc15 (feat: implement complete authentication system)
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
<<<<<<< HEAD
  user: User
=======
  tokenType: string
  username: string
  email: string
  isOperator: boolean
>>>>>>> 423cc15 (feat: implement complete authentication system)
}

export interface RefreshTokenRequest {
  refreshToken: string
}

<<<<<<< HEAD
export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
=======
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
>>>>>>> 423cc15 (feat: implement complete authentication system)
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
<<<<<<< HEAD
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
=======
}
>>>>>>> 423cc15 (feat: implement complete authentication system)
