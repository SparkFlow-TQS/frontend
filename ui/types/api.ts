/**
 * API-related type definitions
 */

import { ChargingStation, StationSearchFilters } from './station'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  success: false
  message: string
  status?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface StationApiMethods {
  getAllStations(): Promise<ChargingStation[]>
  getTotalStationCount(): Promise<number>
  getStationById(id: number): Promise<ChargingStation>
  createStation(station: Omit<ChargingStation, 'id'>): Promise<ChargingStation>
  getNearbyStations(latitude: number, longitude: number, radius?: number): Promise<ChargingStation[]>
  searchStations(filters: StationSearchFilters): Promise<ChargingStation[]>
}

export interface HttpMethod {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: string
}

export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

export interface BookingDTO {
  id: number
  stationId: number
  stationName?: string
  userId: number
  startTime: string
  endTime: string
  displayStatus?: string
  estimatedCost?: number
}

export interface CreateBookingRequest {
  stationId: number
  userId: number
  startTime: string
  endTime: string
  recurringDays?: Set<number>
}

export interface RecurringBookingRequest {
  userId: number
  stationId: number
  startTime: string
  endTime: string
  recurringDays: Set<number>
}

export type ApiBookingStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED'

export interface Booking {
  id: number
  stationId: number
  userId: number
  startTime: string
  endTime: string
  recurringDays?: Set<number>
  status: ApiBookingStatus
} 