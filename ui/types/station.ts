/**
 * Station-related type definitions
 */

export interface ChargingStation {
  id: number
  externalId?: string
  name: string
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  status: string
  quantityOfChargers: number
  power?: number
  isOperational: boolean
  price?: number
  numberOfChargers?: number
  minPower?: number
  maxPower?: number
}

export interface CreateStationRequest extends Omit<ChargingStation, 'id'> {
  // Fields required for creation
}

export type StationStatus = 'operational' | 'out_of_service' | 'maintenance' | 'unknown'

export interface StationSearchFilters {
  name?: string
  city?: string
  country?: string
  minChargers?: number
} 