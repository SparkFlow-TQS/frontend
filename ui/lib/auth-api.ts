import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenRequest, 
  User
} from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export class AuthAPI {
  private static baseURL = `${API_BASE_URL}/auth`
  private static userURL = `${API_BASE_URL}/users`

  /**
   * Login user with email/username and password
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }))
        throw new AuthError(errorData.message || 'Login failed', response.status)
      }

      const data: AuthResponse = await response.json()
      return data
    } catch (error) {
      console.error('Login error:', error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Network error during login')
    }
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }))
        throw new AuthError(errorData.message || 'Registration failed', response.status)
      }

      const data: AuthResponse = await response.json()
      return data
    } catch (error) {
      console.error('Registration error:', error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Network error during registration')
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshTokenRequest: RefreshTokenRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refreshTokenRequest),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Token refresh failed' }))
        throw new AuthError(errorData.message || 'Token refresh failed', response.status)
      }

      const data: AuthResponse = await response.json()
      return data
    } catch (error) {
      console.error('Token refresh error:', error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Network error during token refresh')
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(token: string): Promise<User> {
    try {
      const response = await fetch(`${this.userURL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch profile' }))
        throw new AuthError(errorData.message || 'Failed to fetch profile', response.status)
      }

      const user: User = await response.json()
      return user
    } catch (error) {
      console.error('Profile fetch error:', error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Network error while fetching profile')
    }
  }

  /**
   * Test endpoint access (for verification)
   */
  static async testAccess(token: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.userURL}/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Access test failed' }))
        throw new AuthError(errorData.message || 'Access test failed', response.status)
      }

      return await response.json()
    } catch (error) {
      console.error('Access test error:', error)
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Network error during access test')
    }
  }

  /**
   * Create authenticated fetch function with automatic token injection
   */
  static createAuthenticatedFetch(getToken: () => string | null) {
    return async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = getToken()
      
      const headers = new Headers(options.headers)
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')

      return fetch(url, {
        ...options,
        headers,
      })
    }
  }
}

/**
 * Custom AuthError class for better error handling
 */
class AuthError extends Error {
  constructor(message: string, public status?: number, public field?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export { AuthError }