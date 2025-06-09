'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react'
import { AuthAPI, AuthError } from './auth-api'
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthContextType, 
  TokenData,
  AuthStatus 
} from '@/types/auth'

// Local storage keys
const TOKEN_STORAGE_KEY = 'sparkflow_tokens'
const USER_STORAGE_KEY = 'sparkflow_user'

// Auth state interface
interface AuthState {
  user: User | null
  status: AuthStatus
  error: string | null
  tokens: TokenData | null
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: TokenData } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_TOKENS'; payload: TokenData }

// Initial state
const initialState: AuthState = {
  user: null,
  status: 'loading',
  error: null,
  tokens: null,
}

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        status: 'loading',
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        status: 'authenticated',
        error: null,
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        tokens: null,
        status: 'unauthenticated',
        error: action.payload,
      }
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        status: 'unauthenticated',
        error: null,
      }
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'AUTH_UPDATE_TOKENS':
      return {
        ...state,
        tokens: action.payload,
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Token management utilities
const saveTokensToStorage = (tokens: TokenData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
  }
}

const getTokensFromStorage = (): TokenData | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (stored) {
      try {
        const tokens = JSON.parse(stored) as TokenData
        // Check if token is expired
        if (Date.now() < tokens.expiresAt) {
          return tokens
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY)
        }
      } catch (error) {
        console.error('Error parsing stored tokens:', error)
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      }
    }
  }
  return null
}

const saveUserToStorage = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  }
}

const getUserFromStorage = (): User | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored) as User
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }
  }
  return null
}

const clearStoredData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

// Calculate token expiration (JWT typically expires in 1 hour, so we set it for 50 minutes)
const calculateTokenExpiration = (accessToken: string): number => {
  try {
    // Decode JWT payload (simplified - in production, use a proper JWT library)
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    if (payload.exp) {
      return payload.exp * 1000 // Convert to milliseconds
    }
  } catch {
    console.warn('Could not decode JWT token, using default expiration')
  }
  // Default to 50 minutes from now
  return Date.now() + 50 * 60 * 1000
}

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedTokens = getTokensFromStorage()
      const storedUser = getUserFromStorage()

      if (storedTokens && storedUser) {
        try {
          // Verify token is still valid by testing API access
          await AuthAPI.testAccess(storedTokens.accessToken)
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: storedUser,
              tokens: storedTokens,
            },
          })
        } catch {
          console.warn('Stored token is invalid, attempting refresh...')
          
          // Try to refresh token
          try {
            const refreshResponse = await AuthAPI.refreshToken({
              refreshToken: storedTokens.refreshToken,
            })
            
            const newTokens: TokenData = {
              accessToken: refreshResponse.accessToken,
              refreshToken: refreshResponse.refreshToken,
              expiresAt: calculateTokenExpiration(refreshResponse.accessToken),
            }
            
            saveTokensToStorage(newTokens)
            saveUserToStorage(refreshResponse.user)
            
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: refreshResponse.user,
                tokens: newTokens,
              },
            })
          } catch {
            console.warn('Token refresh failed, logging out')
            clearStoredData()
            dispatch({ type: 'AUTH_LOGOUT' })
          }
        }
      } else {
        dispatch({ type: 'AUTH_LOGOUT' })
      }
    }

    initializeAuth()
  }, [])

  const refreshToken = useCallback(async (): Promise<void> => {
    if (!state.tokens?.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await AuthAPI.refreshToken({
        refreshToken: state.tokens.refreshToken,
      })
      
      const newTokens: TokenData = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: calculateTokenExpiration(response.accessToken),
      }
      
      saveTokensToStorage(newTokens)
      saveUserToStorage(response.user)
      
      dispatch({ type: 'AUTH_UPDATE_TOKENS', payload: newTokens })
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      throw error
    }
  }, [state.tokens?.refreshToken])

  // Auto-refresh token before expiration
  useEffect(() => {
    if (state.tokens && state.status === 'authenticated') {
      const timeUntilExpiry = state.tokens.expiresAt - Date.now()
      const refreshThreshold = 5 * 60 * 1000 // 5 minutes before expiry

      if (timeUntilExpiry > refreshThreshold) {
        const timeout = setTimeout(async () => {
          try {
            await refreshToken()
          } catch (error) {
            console.error('Auto-refresh failed:', error)
            logout()
          }
        }, timeUntilExpiry - refreshThreshold)

        return () => clearTimeout(timeout)
      }
    }
  }, [state.tokens, state.status, refreshToken])

  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'AUTH_LOADING' })
    
    try {
      const response = await AuthAPI.login(credentials)
      
      const tokens: TokenData = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: calculateTokenExpiration(response.accessToken),
      }
      
      saveTokensToStorage(tokens)
      saveUserToStorage(response.user)
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens,
        },
      })
    } catch (error) {
      const message = error instanceof AuthError ? error.message : 'Login failed'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const register = async (userData: RegisterRequest): Promise<void> => {
    dispatch({ type: 'AUTH_LOADING' })
    
    try {
      const response = await AuthAPI.register(userData)
      
      const tokens: TokenData = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: calculateTokenExpiration(response.accessToken),
      }
      
      saveTokensToStorage(tokens)
      saveUserToStorage(response.user)
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          tokens,
        },
      })
    } catch (error) {
      const message = error instanceof AuthError ? error.message : 'Registration failed'
      dispatch({ type: 'AUTH_ERROR', payload: message })
      throw error
    }
  }

  const logout = (): void => {
    clearStoredData()
    dispatch({ type: 'AUTH_LOGOUT' })
  }


  const isOperator = (): boolean => {
    return state.user?.operator ?? false
  }

  const contextValue: AuthContextType = {
    user: state.user,
    isAuthenticated: state.status === 'authenticated',
    isLoading: state.status === 'loading',
    login,
    register,
    logout,
    refreshToken,
    isOperator,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for pages that require authentication
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireOperator?: boolean } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, isOperator } = useAuth()

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      )
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      return null
    }

    if (options.requireOperator && !isOperator()) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-600">
            Access denied. Operator privileges required.
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

export { AuthContext }