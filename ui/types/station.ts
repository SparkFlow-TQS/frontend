/**
 * Station-related type definitions
 * Consistent with station-service Station model
 */

export interface ChargingStation {
  id: number // Must be number to match station-service Long ID
  externalId?: string
  name: string
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  status: string
  quantityOfChargers: number // Default to 2 chargers per station
  power?: number
  isOperational: boolean
  price?: number
  // Legacy fields for compatibility (use quantityOfChargers instead)
  numberOfChargers?: number
  minPower?: number
  maxPower?: number
}

// Default station configuration
export const DEFAULT_CHARGERS_PER_STATION = 2

// Helper function to ensure station has proper charger count
export const normalizeStation = (station: ChargingStation): ChargingStation => {
  return {
    ...station,
    quantityOfChargers: station.quantityOfChargers || station.numberOfChargers || DEFAULT_CHARGERS_PER_STATION,
    id: typeof station.id === 'string' ? parseInt(station.id) : station.id
  }
}

export type StationStatus = 'operational' | 'out_of_service' | 'maintenance' | 'unknown'

export interface StationSearchFilters {
  name?: string
  city?: string
  country?: string
  minChargers?: number
} 