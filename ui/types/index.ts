/**
 * Central type exports for the application
 * This provides a single entry point for all type definitions
 */

// Station-related types
export * from './station'

// Map-related types
export * from './map'

// Modal and form types
export * from './modal'

// API types
export * from './api'

// Authentication types
export * from './auth'

// Common/shared types
export * from './common'

// Reservation types
export * from './reservation'

// Authentication types
export * from './auth'

// Re-export commonly used types for convenience
export type { ChargingStation } from './station'
export type { FilterCriteria, MapFeaturesProps } from './map'
export type { CreateStationModalProps } from './modal'
export type { LoadingState, Location } from './common'
export type { Reservation, ReservationRequest, TimeSlot, StationAvailability } from './reservation'
export type { User, LoginRequest, RegisterRequest, AuthContextType } from './auth' 