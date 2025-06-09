/**
 * Modal and form-related type definitions
 */

import { ChargingStation } from './station'

export interface CreateStationModalProps {
  isOpen: boolean
  onClose: () => void
  onStationCreated: (station: ChargingStation) => void
  defaultLocation?: { lat: number; lng: number }
}

export interface StationFormData {
  name: string
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  quantityOfChargers: number
  power: number
  isOperational: boolean
  status: string
}

export interface ModalBaseProps {
  isOpen: boolean
  onClose: () => void
}

export interface ConfirmationModalProps extends ModalBaseProps {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: 'default' | 'destructive'
} 