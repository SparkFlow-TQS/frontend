"use client"

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Button } from './ui/button'
import { MapPin } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Define charging station type
export type ChargingStation = {
  id: string
  name: string
  location: string
  coordinates: [number, number]
  kw: number
  connectorType: string
  isOperational: boolean
}

interface LeafletMapProps {
  center: [number, number]
  zoom: number
  stations: ChargingStation[]
  onNavigate: (lat: number, lng: number) => void
}

export default function LeafletMap({ center, zoom, stations, onNavigate }: LeafletMapProps) {
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

  // Custom marker icon based on charging station status
  const getMarkerIcon = (isOperational: boolean) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div class="w-8 h-8 flex items-center justify-center rounded-full ${isOperational ? 'bg-green-600' : 'bg-red-600'}">
               <div class="w-5 h-5 text-white flex items-center justify-center">⚡</div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
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
      
      {stations.map((station) => (
        <Marker 
          key={station.id}
          position={station.coordinates}
          icon={getMarkerIcon(station.isOperational)}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-lg">{station.name}</h3>
              <p className="text-sm">{station.id} - {station.location}</p>
              <p className="text-sm mt-1">{station.kw} kW • {station.connectorType}</p>
              <p className="text-sm font-medium mt-1">
                <span className={`px-2 py-0.5 rounded ${station.isOperational ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {station.isOperational ? 'Operational' : 'Out of Service'}
                </span>
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-2 w-full flex items-center gap-1"
                onClick={() => onNavigate(station.coordinates[0], station.coordinates[1])}
              >
                <MapPin className="h-3 w-3" />
                <span>Navigate</span>
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
} 