"use client"

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import type { ChargingStation, ChargingMapProps } from '@/types'

const LeafletMap = dynamic(() => import('@/app/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-200 rounded-lg animate-pulse"></div>
})

export default function ChargingMap({ 
  zoom = 14, 
  center = [40.623361, -8.650256], 
  stations = [],
  searchCenter,
  searchRadius,
  onSearchCenterChange,
  isPinpointMode = false
}: ChargingMapProps) {
  const router = useRouter()
  
  const displayStations = useMemo(() => {
    return stations.length > 0 ? stations : []
  }, [stations])
  
  const handleNavigate = (lat: number, lng: number) => {
    if (typeof window !== 'undefined') {
      // Validate coordinates before opening external URL
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error('Invalid coordinates for navigation')
        return
      }
      const newWindow = window.open('', '_blank', 'noopener,noreferrer')
      if (newWindow) {
        newWindow.location.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      }
    }
  }

  const handleSchedule = (station: ChargingStation) => {
    // Navigate to schedule page with station data
    const stationData = encodeURIComponent(JSON.stringify(station))
    router.push(`/schedule?stationData=${stationData}`)
  }

  return (
    <div className="h-full w-full">
      <LeafletMap
        center={center}
        zoom={zoom}
        stations={displayStations}
        onNavigate={handleNavigate}
        onSchedule={handleSchedule}
        searchCenter={searchCenter}
        searchRadius={searchRadius}
        onSearchCenterChange={onSearchCenterChange}
        isPinpointMode={isPinpointMode}
      />
    </div>
  )
} 