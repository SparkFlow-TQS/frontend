/**
 * Map-related type definitions
 */

import { ChargingStation } from './station'

export interface FilterCriteria {
  minChargers?: number
  minPower?: number
  maxPower?: number
  maxPrice?: number
  maxDistance?: number
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
  readonly zoom: number
  readonly center: [number, number]
  readonly stations?: ChargingStation[]
  readonly searchCenter?: [number, number] | null
  readonly searchRadius?: number
  readonly onSearchCenterChange?: (lat: number, lng: number) => void
  readonly isPinpointMode?: boolean
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