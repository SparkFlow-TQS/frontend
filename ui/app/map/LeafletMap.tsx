"use client"

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet'
import { Button } from '../../components/ui/button'
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'


// Import types from centralized location
import type {
  LeafletMapProps,
  MapClickHandlerProps,
  ZoomHandlerProps,
  PopupControllerProps,
  MapMarkerSize
} from '@/types'

// Component to handle automatic popup opening for single stations
function PopupController({ stations }: PopupControllerProps) {
  const map = useMap()
  const lastStationId = useRef<number | null>(null)

  useEffect(() => {
    // Only auto-open popup if there's exactly one station and it's different from the last one
    if (stations.length === 1) {
      const station = stations[0]
      if (station.id !== lastStationId.current) {
        lastStationId.current = station.id
        
        // Small delay to ensure marker is rendered
        setTimeout(() => {
          map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              const position = layer.getLatLng()
              if (position.lat === station.latitude && position.lng === station.longitude) {
                layer.openPopup()
              }
            }
          })
        }, 100)
      }
    } else {
      lastStationId.current = null
    }
  }, [stations, map])

  return null
}

// Component to handle map clicks for setting search center
function MapClickHandler({ 
  onSearchCenterChange, 
  isPinpointMode 
}: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      if (onSearchCenterChange && isPinpointMode) {
        onSearchCenterChange(e.latlng.lat, e.latlng.lng)
      }
    }
  })
  return null
}

// Component to track zoom level changes
function ZoomHandler({ onZoomChange }: ZoomHandlerProps) {
  useMapEvents({
    zoomend: (e) => {
      onZoomChange(e.target.getZoom())
    }
  })
  return null
}

export default function LeafletMap({ 
  center, 
  zoom, 
  stations, 
  onNavigate, 
  onSchedule, 
  searchCenter, 
  searchRadius = 25,
  onSearchCenterChange,
  isPinpointMode = false
}: LeafletMapProps) {
  const [currentZoom, setCurrentZoom] = useState(zoom)

  // Fix Leaflet icon issues
  useEffect(() => {
    // @ts-expect-error - Leaflet icon issue
    delete L.Icon.Default.prototype._getIconUrl
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    })
  }, [])

  // Calculate marker size based on zoom level
  const getMarkerSize = (zoom: number): MapMarkerSize => {
    // Base size at zoom level 14
    const baseSize = 32
    const baseZoom = 14
    
    // Scale factor: increase/decrease size based on zoom difference
    const scaleFactor = Math.pow(1.15, zoom - baseZoom)
    
    // Constrain size between 16px and 48px
    const size = Math.max(16, Math.min(48, baseSize * scaleFactor))
    
    return {
      size: Math.round(size),
      innerSize: Math.round(size * 0.625) // 5/8 of outer size for inner icon
    }
  }

  // Custom marker icon based on charging station status and zoom level
  const getMarkerIcon = (isOperational: boolean, zoom: number) => {
    const { size, innerSize } = getMarkerSize(zoom)
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div class="flex items-center justify-center rounded-full ${isOperational ? 'bg-green-600' : 'bg-red-600'}" style="width: ${size}px; height: ${size}px;">
               <div class="text-white flex items-center justify-center" style="width: ${innerSize}px; height: ${innerSize}px; font-size: ${Math.max(8, innerSize * 0.6)}px;">⚡</div>
             </div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    })
  }

  // Custom search center icon
  const getSearchCenterIcon = () => {
    return L.divIcon({
      className: 'search-center-marker',
      html: `<div class="flex items-center justify-center" style="width: 24px; height: 24px;">
               <div class="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                 <div class="w-2 h-2 bg-white rounded-full"></div>
               </div>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })
  }



  return (
    <MapContainer 
      center={center}
      zoom={zoom} 
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <ZoomHandler onZoomChange={setCurrentZoom} />
      <MapClickHandler 
        onSearchCenterChange={onSearchCenterChange} 
        isPinpointMode={isPinpointMode}
      />
      <PopupController stations={stations} />
      
      {/* Search center marker and radius - only show when searchCenter is provided */}
      {searchCenter && (
        <>
          <Marker 
            position={searchCenter}
            icon={getSearchCenterIcon()}
            draggable={isPinpointMode}
            eventHandlers={{
              dragend: (e) => {
                if (isPinpointMode && onSearchCenterChange) {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  onSearchCenterChange(position.lat, position.lng);
                }
              }
            }}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-semibold">Search Center</h4>
                <p className="text-sm text-gray-600">
                  {isPinpointMode ? 'Drag to change search location' : 'Search location'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Radius: {searchRadius} km
                </p>
              </div>
            </Popup>
          </Marker>
          
          <Circle
            center={searchCenter}
            radius={searchRadius * 1000} // Convert km to meters
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5'
            }}
          />
        </>
      )}
      
      {/* Station markers */}
      {stations.map((station) => (
        <Marker 
          key={station.id}
          position={[station.latitude, station.longitude]}
          icon={getMarkerIcon(station.isOperational, currentZoom)}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-lg">{station.name}</h3>
              <p className="text-sm">{station.externalId || station.id} - {station.city}</p>
              <p className="text-sm">{station.address}</p>
              <p className="text-sm mt-1">{station.power || 'N/A'} kW • {station.quantityOfChargers} {station.quantityOfChargers === 1 ? 'charger' : 'chargers'}</p>
              <p className="text-sm font-medium mt-1">
                <span className={`px-2 py-0.5 rounded ${station.isOperational ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {station.isOperational ? 'Operational' : 'Out of Service'}
                </span>
              </p>
              <div className="mt-2 space-y-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full flex items-center gap-1"
                  onClick={() => onNavigate(station.latitude, station.longitude)}
                >
                  <FaMapMarkerAlt className="h-3 w-3" />
                  <span>Navigate</span>
                </Button>
                {onSchedule && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full flex items-center gap-1 border-[#FFA500] text-[#FFA500] hover:bg-[#FFA500] hover:text-white"
                    onClick={() => onSchedule(station)}
                  >
                    <FaClock className="h-3 w-3" />
                    <span>Schedule</span>
                  </Button>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
} 