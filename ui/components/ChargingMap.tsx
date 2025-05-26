"use client"

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { type ChargingStation } from './LeafletMap'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 rounded-lg animate-pulse"></div>
})

const mockStations: ChargingStation[] = [
  {
    id: "AVR-00023/24",
    name: "Mercadona",
    location: "Aveiro",
    coordinates: [40.623361, -8.650256],
    kw: 22,
    connectorType: "Type 2",
    isOperational: true
  },
  {
    id: "AVR-00025/26",
    name: "Shopping Center",
    location: "Aveiro",
    coordinates: [40.635, -8.645],
    kw: 50,
    connectorType: "CCS",
    isOperational: true
  },
  {
    id: "AVR-00027/28",
    name: "City Center",
    location: "Aveiro",
    coordinates: [40.640, -8.653],
    kw: 11,
    connectorType: "Type 2",
    isOperational: false
  }
]

interface ChargingMapProps {
  zoom: number;
  center: [number, number];
  stations?: ChargingStation[]
}

export default function ChargingMap({ 
  zoom = 14, 
  center = [40.623361, -8.650256], 
  stations = [] 
}: ChargingMapProps) {
  const displayStations = useMemo(() => {
    return stations.length > 0 ? stations : mockStations
  }, [stations])
  
  const handleNavigate = (lat: number, lng: number) => {
    if (typeof window !== 'undefined') {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
    }
  }

  return (
    <div className="h-full w-full">
      <LeafletMap
        center={center}
        zoom={zoom}
        stations={displayStations}
        onNavigate={handleNavigate}
      />
    </div>
  )
} 