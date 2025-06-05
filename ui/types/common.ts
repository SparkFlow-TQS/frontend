/**
 * Common/shared type definitions
 */

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface LoadingProps {
  isLoading: boolean
  error?: string | null
}

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface Location {
  latitude: number
  longitude: number
}

export interface GeolocationCoords extends Location {
  accuracy?: number
  altitude?: number | null
  altitudeAccuracy?: number | null
  heading?: number | null
  speed?: number | null
}

export interface ErrorInfo {
  message: string
  code?: string | number
  details?: unknown
}

export interface SelectOption<T = string> {
  value: T
  label: string
  disabled?: boolean
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

export type Theme = 'light' | 'dark' | 'system'

export type Variant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'

export type Size = 'sm' | 'md' | 'lg' | 'xl'

export interface TimeSlot {
  start: string
  end: string
  label: string
}

export interface RepeatOption {
  value: string
  label: string
} 