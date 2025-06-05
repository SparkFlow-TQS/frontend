/**
 * Reservation-related type definitions
 * Consistent with station-service Booking model
 */

export interface TimeSlot {
  start: Date
  end: Date
}

// Station-service booking statuses
export type BookingStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED'

// Frontend display statuses (for UI compatibility)
export type ReservationDisplayStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'

export interface Reservation {
  id: string // Generated UUID for frontend, will be Long in backend
  stationId: number // Station ID as number to match station-service
  stationName: string // For display purposes
  userId?: number // Will be required as Long when connected to backend
  timeSlot: TimeSlot
  chargerCount: number // Number of chargers reserved (not used in backend but useful for frontend)
  status: BookingStatus // Backend-compatible status
  displayStatus: ReservationDisplayStatus // Frontend-friendly status for UI
  recurringDays?: Set<number> // Days of week (0-6, where 0 is Sunday) - matches backend
  createdAt: Date
  updatedAt: Date
  estimatedCost?: number
}

export interface ReservationRequest {
  stationId: number
  timeSlot: TimeSlot
  chargerCount: number
  recurringDays?: Set<number> // Optional recurring days
}

export interface StationAvailability {
  stationId: number
  date: string // YYYY-MM-DD format
  timeSlots: {
    time: string // HH:mm format
    availableChargers: number
    totalChargers: number
    isBlocked: boolean
  }[]
}

export interface ReservationConflict {
  timeSlot: TimeSlot
  conflictingReservations: Reservation[]
  availableChargers: number
}

export interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
  station: import('./station').ChargingStation
  onReservationCreated: (reservation: Reservation) => void
}

// Helper functions for status conversion
export const backendToDisplayStatus = (backendStatus: BookingStatus): ReservationDisplayStatus => {
  switch (backendStatus) {
    case 'ACTIVE':
      return 'active'
    case 'CANCELLED':
      return 'cancelled'
    case 'COMPLETED':
      return 'completed'
    default:
      return 'pending'
  }
}

export const displayToBackendStatus = (displayStatus: ReservationDisplayStatus): BookingStatus => {
  switch (displayStatus) {
    case 'active':
    case 'confirmed':
    case 'pending':
      return 'ACTIVE'
    case 'cancelled':
      return 'CANCELLED'
    case 'completed':
      return 'COMPLETED'
    default:
      return 'ACTIVE'
  }
}

// Recurring days helper
export const getDayOfWeek = (date: Date): number => {
  return date.getDay() // 0 = Sunday, 1 = Monday, etc.
}

export const getDayName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayIndex] || 'Unknown'
}

export const formatRecurringDays = (recurringDays?: Set<number>): string => {
  if (!recurringDays || recurringDays.size === 0) {
    return 'One-time'
  }
  
  if (recurringDays.size === 7) {
    return 'Daily'
  }
  
  const sortedDays = Array.from(recurringDays).sort()
  
  // Check for weekdays (Monday-Friday)
  if (sortedDays.length === 5 && 
      sortedDays.every(day => day >= 1 && day <= 5)) {
    return 'Weekdays'
  }
  
  // Check for weekends
  if (sortedDays.length === 2 && 
      sortedDays.includes(0) && sortedDays.includes(6)) {
    return 'Weekends'
  }
  
  // Custom days
  return sortedDays.map(day => getDayName(day)).join(', ')
} 