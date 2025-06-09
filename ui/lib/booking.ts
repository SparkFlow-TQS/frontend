import { 
  Booking, 
  CreateBookingRequest, 
  RecurringBookingRequest
} from '@/types/api'
import { AuthAPI } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

export class BookingAPI {
  static async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    const token = AuthAPI.getStoredToken()
    if (!token) {
      throw new Error('User not authenticated')
    }

    const booking: Booking = {
      id: 0,
      stationId: bookingData.stationId,
      userId: bookingData.userId,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      recurringDays: bookingData.recurringDays,
      status: 'ACTIVE'
    }

    const response = await fetch(`${API_BASE_URL}/station/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(booking)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create booking: ${response.status} ${errorText}`)
    }

    return response.json()
  }

  static async createRecurringBooking(recurringData: RecurringBookingRequest): Promise<Booking> {
    const token = AuthAPI.getStoredToken()
    if (!token) {
      throw new Error('User not authenticated')
    }

    const recurringDaysArray = Array.from(recurringData.recurringDays)
    const params = new URLSearchParams({
      userId: recurringData.userId.toString(),
      stationId: recurringData.stationId.toString(),
      startTime: recurringData.startTime,
      endTime: recurringData.endTime,
      ...recurringDaysArray.reduce((acc, day, index) => {
        acc[`recurringDays[${index}]`] = day.toString()
        return acc
      }, {} as Record<string, string>)
    })

    const response = await fetch(`${API_BASE_URL}/station/bookings/recurring?${params}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to create recurring booking: ${response.status} ${errorText}`)
    }

    return response.json()
  }

  static async getBookingById(id: number): Promise<Booking> {
    const token = AuthAPI.getStoredToken()
    if (!token) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/station/bookings/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get booking: ${response.status}`)
    }

    return response.json()
  }

  static async getAllBookings(userId: number): Promise<Booking[]> {
    const token = AuthAPI.getStoredToken()
    if (!token) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/station/bookings?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.status === 204) {
      return []
    }

    if (!response.ok) {
      throw new Error(`Failed to get bookings: ${response.status}`)
    }

    return response.json()
  }

  static async getBookingsByUserId(userId: number): Promise<Booking[]> {
    const token = AuthAPI.getStoredToken()
    if (!token) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/station/bookings/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.status === 204) {
      return []
    }

    if (!response.ok) {
      throw new Error(`Failed to get user bookings: ${response.status}`)
    }

    return response.json()
  }

  static async getBookingsByStationId(stationId: number): Promise<Booking[]> {
    const token = AuthAPI.getStoredToken()
    if (!token) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/station/bookings/station/${stationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.status === 204) {
      return []
    }

    if (!response.ok) {
      throw new Error(`Failed to get station bookings: ${response.status}`)
    }

    return response.json()
  }

  static async cancelBooking(id: number): Promise<void> {
    const token = AuthAPI.getStoredToken()
    if (!token) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/station/bookings/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to cancel booking: ${response.status}`)
    }
  }
}