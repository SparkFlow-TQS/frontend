/**
 * Station-related type definitions
 */

export interface ChargingStation {
  id: number
  externalId?: string
  name: string
  address: string
  city: string
  country?: string
  latitude: number
  longitude: number
  status?: string
  connectorType: string
  power?: number
  isOperational: boolean
}

export interface CreateStationRequest extends Omit<ChargingStation, 'id'> {
  // Add any additional fields specific to creation if needed
}

export type StationStatus = 'operational' | 'out_of_service' | 'maintenance' | 'unknown'

export type ConnectorType = 'Type 1' | 'Type 2' | 'CCS' | 'CHAdeMO' | 'Tesla'

export interface StationSearchFilters {
  name?: string
  city?: string
  country?: string
  connectorType?: string
} 