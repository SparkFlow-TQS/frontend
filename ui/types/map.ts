/**
 * Map-related type definitions
 */

import { ChargingStation } from './station'

export interface FilterCriteria {
  connectorTypes: string[]
  minPower: number
  maxPower: number
  maxPrice: number
  maxDistance: number
}

export interface MapFeaturesProps {
  onLocationRequest?: () => void
  onFiltersChange?: (filters: FilterCriteria) => void
}

export interface LeafletMapProps {
  center: [number, number]
  zoom: number
  stations: ChargingStation[]
  onNavigate: (lat: number, lng: number) => void
  onSchedule?: (station: ChargingStation) => void
  searchCenter?: [number, number] | null
  searchRadius?: number
  onSearchCenterChange?: (lat: number, lng: number) => void
  isPinpointMode?: boolean
}

export interface ChargingMapProps {
  zoom: number
  center: [number, number]
  stations?: ChargingStation[]
  searchCenter?: [number, number] | null
  searchRadius?: number
  onSearchCenterChange?: (lat: number, lng: number) => void
  isPinpointMode?: boolean
}

export interface MapClickHandlerProps {
  onSearchCenterChange?: (lat: number, lng: number) => void
  isPinpointMode?: boolean
}

export interface ZoomHandlerProps {
  onZoomChange: (zoom: number) => void
}

export interface PopupControllerProps {
  stations: ChargingStation[]
}

export type Coordinates = [number, number]

export interface MapMarkerSize {
  size: number
  innerSize: number
} 