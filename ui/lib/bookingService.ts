import { 
  Reservation, 
  ReservationRequest, 
  TimeSlot, 
  backendToDisplayStatus
} from '@/types/reservation'
import { BookingAPI } from './booking'
import { CreateBookingRequest, Booking } from '@/types/api'

export class BookingService {
  
  static convertBookingToReservation(booking: Booking): Reservation {
    return {
      id: booking.id.toString(),
      stationId: booking.stationId,
      stationName: '', // Will be populated from station data if needed
      userId: booking.userId,
      timeSlot: {
        start: new Date(booking.startTime),
        end: new Date(booking.endTime)
      },
      chargerCount: 1, // Default for now, could be enhanced
      status: booking.status,
      displayStatus: backendToDisplayStatus(booking.status),
      recurringDays: booking.recurringDays,
      createdAt: new Date(), // Not provided by backend
      updatedAt: new Date(), // Not provided by backend
      estimatedCost: 0 // Will be calculated if needed
    }
  }

  static convertReservationToBooking(reservation: ReservationRequest, userId: number): CreateBookingRequest {
    return {
      stationId: reservation.stationId,
      userId,
      startTime: reservation.timeSlot.start.toISOString(),
      endTime: reservation.timeSlot.end.toISOString(),
      recurringDays: reservation.recurringDays
    }
  }

  static async getAllReservations(userId: number): Promise<Reservation[]> {
    try {
      const bookings = await BookingAPI.getBookingsByUserId(userId)
      return bookings
        .map(booking => this.convertBookingToReservation(booking))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (error) {
      console.error('Error loading reservations from API:', error)
      return []
    }
  }

  static async createReservation(
    request: ReservationRequest, 
    stationName: string, 
    userId: number
  ): Promise<Reservation> {
    try {
      const bookingRequest = this.convertReservationToBooking(request, userId)
      
      let booking: Booking
      if (request.recurringDays && request.recurringDays.size > 0) {
        booking = await BookingAPI.createRecurringBooking({
          userId,
          stationId: request.stationId,
          startTime: request.timeSlot.start.toISOString(),
          endTime: request.timeSlot.end.toISOString(),
          recurringDays: request.recurringDays
        })
      } else {
        booking = await BookingAPI.createBooking(bookingRequest)
      }

      const reservation = this.convertBookingToReservation(booking)
      reservation.stationName = stationName
      reservation.chargerCount = request.chargerCount
      reservation.estimatedCost = this.calculateEstimatedCost(request.timeSlot, request.chargerCount)
      
      return reservation
    } catch (error) {
      console.error('Error creating reservation:', error)
      throw error
    }
  }

  static async getReservationsForStation(stationId: number): Promise<Reservation[]> {
    try {
      const bookings = await BookingAPI.getBookingsByStationId(stationId)
      return bookings.map(booking => this.convertBookingToReservation(booking))
    } catch (error) {
      console.error('Error loading station reservations:', error)
      return []
    }
  }

  static async updateReservationStatus(): Promise<boolean> {
    try {
      // Note: The current API doesn't have an update status endpoint
      // This would need to be implemented in the backend
      console.warn('Update reservation status not yet implemented in API')
      return false
    } catch (error) {
      console.error('Error updating reservation status:', error)
      return false
    }
  }

  static async cancelReservation(reservationId: string): Promise<boolean> {
    try {
      await BookingAPI.cancelBooking(parseInt(reservationId))
      return true
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      return false
    }
  }

  static calculateEstimatedCost(timeSlot: TimeSlot, chargerCount: number): number {
    const hours = (timeSlot.end.getTime() - timeSlot.start.getTime()) / (1000 * 60 * 60)
    const baseRatePerHour = 6.50 // €6.50 per hour per charger
    return Number((hours * chargerCount * baseRatePerHour).toFixed(2))
  }

  // For backward compatibility with existing components
  static generateReservationId(): string {
    return 'res_' + Date.now() + '_' + crypto.randomUUID().replace(/-/g, '').slice(0, 9)
  }
}