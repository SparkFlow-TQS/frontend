/**
 * Reservation-related type definitions
 */

export interface TimeSlot {
  start: Date
  end: Date
}

export interface Reservation {
  id: string
  stationId: number | string
  stationName: string
  userId?: string // For future API integration
  timeSlot: TimeSlot
  chargerCount: number // Number of chargers reserved
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  estimatedCost?: number
}

export interface ReservationRequest {
  stationId: number | string
  timeSlot: TimeSlot
  chargerCount: number
}

export interface StationAvailability {
  stationId: number | string
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