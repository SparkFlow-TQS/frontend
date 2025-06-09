import { ChargingStation } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export class StationAPI {
  private static baseURL = `${API_BASE_URL}/station/api/v1/stations`

  static async getAllStations(): Promise<ChargingStation[]> {
    try {
      const response = await fetch(this.baseURL)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stations: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching stations:', error)
      throw error
    }
  }

  static async getTotalStationCount(): Promise<number> {
    try {
      const response = await fetch(`${this.baseURL}/count`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch station count: ${response.status}`)
      }
      
      const count = await response.json()
      return count
    } catch (error) {
      console.error('Error fetching station count:', error)
      throw error
    }
  }

  static async getStationById(id: number): Promise<ChargingStation> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch station: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching station:', error)
      throw error
    }
  }

  static async createStation(station: Omit<ChargingStation, 'id'>): Promise<ChargingStation> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(station),
      })
      if (!response.ok) {
        throw new Error(`Failed to create station: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error creating station:', error)
      throw error
    }
  }

  static async getNearbyStations(
    latitude: number, 
    longitude: number, 
    radius: number = 10
  ): Promise<ChargingStation[]> {
    try {
      const url = `${this.baseURL}/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch nearby stations: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching nearby stations:', error)
      throw error
    }
  }

  static async searchStations(filters: {
    name?: string
    city?: string
    country?: string
    minChargers?: number
  }): Promise<ChargingStation[]> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
      
      const response = await fetch(`${this.baseURL}/search?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to search stations: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error searching stations:', error)
      throw error
    }
  }
}

// Statistics types based on the DTOs from station-service
export interface CurrentMonthStats {
  totalCost: number
  estimatedKwh: number
  totalSessions: number
  co2Saved: number
  avgCostPerSession: number
}

export interface MonthlyData {
  month: string
  fullMonth: string
  cost: number
  sessions: number
  duration: number
  kwh: number
  height?: number
  reservations: BookingDTO[]
}

export interface WeeklyData {
  week: string
  sessions: number
  cost: number
  dateRange: string
  height?: number
  reservations: BookingDTO[]
}

export interface CostTrendData {
  month: string
  cost: number
  sessions: number
}

export interface PeriodDetails {
  totalReservations: number
  totalCost: number
  avgCostPerSession: number
  totalKwh: number
  co2Saved: number
  reservations: BookingDTO[]
}

export interface BookingDTO {
  id: number
  userId: number
  stationId: number
  startTime: string
  endTime: string
  cost: number
  status: string
  // Compatibility fields for dashboard
  stationName?: string
  timeSlot?: {
    start: string
    end: string
  }
  chargerCount?: number
  displayStatus?: string
  estimatedCost?: number
}

export class StatisticsAPI {
  private static baseURL = `${API_BASE_URL}/station/api/statistics`

  static async getCurrentMonthStats(): Promise<CurrentMonthStats> {
    try {
      const response = await fetch(`${this.baseURL}/current-month`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch current month stats: ${response.status}`)
      }
      
      const data: CurrentMonthStats = await response.json()
      return data
    } catch (error: unknown) {
      console.error('Error fetching current month stats:', error)
      throw error
    }
  }

  static async getMonthlyStats(months: number = 12): Promise<MonthlyData[]> {
    try {
      const response = await fetch(`${this.baseURL}/monthly?months=${months}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch monthly stats: ${response.status}`)
      }
      
      const data: MonthlyData[] = await response.json()
      return data
    } catch (error: unknown) {
      console.error('Error fetching monthly stats:', error)
      throw error
    }
  }

  static async getWeeklyCurrentMonthStats(): Promise<WeeklyData[]> {
    try {
      const response = await fetch(`${this.baseURL}/weekly-current-month`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch weekly stats: ${response.status}`)
      }
      
      const data: WeeklyData[] = await response.json()
      return data
    } catch (error: unknown) {
      console.error('Error fetching weekly stats:', error)
      throw error
    }
  }

  static async getCostTrend(months: number = 8): Promise<CostTrendData[]> {
    try {
      const response = await fetch(`${this.baseURL}/cost-trend?months=${months}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cost trend: ${response.status}`)
      }
      
      const data: CostTrendData[] = await response.json()
      return data
    } catch (error: unknown) {
      console.error('Error fetching cost trend:', error)
      throw error
    }
  }

  static async getPeriodDetails(period: string, type: 'month' | 'week'): Promise<PeriodDetails> {
    try {
      const response = await fetch(`${this.baseURL}/period-details?period=${period}&type=${type}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch period details: ${response.status}`)
      }
      
      const data: PeriodDetails = await response.json()
      return data
    } catch (error: unknown) {
      console.error('Error fetching period details:', error)
      throw error
    }
  }
}