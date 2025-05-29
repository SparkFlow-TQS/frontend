"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FaMapMarkerAlt, FaSearch, FaPlus } from "react-icons/fa"
import { MapFeatures } from "@/components/mapfeats"
import ChargingMap from "@/components/ChargingMap"
import Navbar from "@/components/navbar"
import CreateStationModal from "@/components/CreateStationModal"
import { type ChargingStation } from '@/components/LeafletMap'
import { StationAPI } from '@/lib/api'

export default function MapPage() {
  const [mapZoom] = useState(14)
  const [center, setCenter] = useState<[number, number]>([40.623361, -8.650256])
  const [stations, setStations] = useState<ChargingStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Fetch stations from the backend
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true)
        setError(null)
        const stationsData = await StationAPI.getAllStations()
        setStations(stationsData)
      } catch (err) {
        console.error('Failed to fetch stations:', err)
        setError('Failed to load charging stations. Please try again later.')
        // Fallback to mock data if API fails
        setStations([
          {
            id: 1,
            externalId: "AVR-00023/24",
            name: "Mercadona",
            address: "Rua Sample 123",
            city: "Aveiro",
            country: "Portugal",
            latitude: 40.623361,
            longitude: -8.650256,
            power: 22,
            connectorType: "Type 2",
            isOperational: true
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchStations()
  }, [])

  const handleStationCreated = (newStation: ChargingStation) => {
    setStations(prev => [...prev, newStation])
    // Optionally center map on new station
    setCenter([newStation.latitude, newStation.longitude])
  }

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  return (
    <div className="flex h-screen flex-col w-screen overflow-hidden">
      <header>
        <Navbar />
      </header>
      {/* Main content area with map and controls */}
      <div className="relative flex-1">
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#14213d]"></div>
                <span>Loading charging stations...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Map starts below navbar */}
        <div className="absolute inset-0 z-0">
          <ChargingMap 
            zoom={mapZoom}
            center={center}
            stations={stations}
          />
        </div>

        {/* Search and controls floating over map */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 py-3 px-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-md z-10">
          <Button variant="outline" className="flex items-center gap-1 bg-white hover:bg-gray-100 z-10 h-9">
            <FaMapMarkerAlt className="h-3.5 w-3.5" />
            <span className="text-sm">Nearest</span>
          </Button>
          <div className="relative flex w-xl">
            <FaSearch className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
            <Input className="pl-8 h-9 bg-white text-sm" placeholder="Search" />
          </div>
          <div className="scale-95">
            <MapFeatures/>
          </div>
        </div>

        {/* Add Charging Station */}
        <Button 
          onClick={handleOpenCreateModal}
          className="absolute bottom-10 left-10 bg-white hover:bg-gray-100 text-black flex items-center gap-2 pl-2 pr-4 z-10"
        >
          <div className="bg-[#14213d] rounded-full p-1 mr-1">
            <FaPlus className="h-4 w-4 text-white" />
          </div>
          Add a Charging Station
        </Button>

        {/* Create Station Modal */}
        <CreateStationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onStationCreated={handleStationCreated}
          defaultLocation={{ lat: center[0], lng: center[1] }}
        />
      </div>
    </div>
  )
}
