import { ChargingStation } from '@/app/map/LeafletMap'

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
    connectorType?: string
  }): Promise<ChargingStation[]> {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
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