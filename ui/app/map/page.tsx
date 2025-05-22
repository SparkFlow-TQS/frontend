"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, MinusIcon, PlusIcon} from "lucide-react"
import { MapFeatures } from "@/components/mapfeats"
import ChargingMap from "@/components/ChargingMap"

export default function MapPage() {
  const [mapZoom, setMapZoom] = useState(14)
  const [center, setCenter] = useState<[number, number]>([40.623361, -8.650256])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Main content area with map and controls */}
      <div className="relative flex-1">
        {/* Map starts below navbar */}
        <div className="absolute inset-0 z-0">
          <ChargingMap 
            height="100%" 
            zoom={mapZoom}
            center={center}
          />
        </div>

        {/* Search and controls floating over map */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 py-3 px-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-md z-10">
          <Button variant="outline" className="flex items-center gap-1 bg-white hover:bg-gray-100 z-10 h-9">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-sm">Nearest</span>
          </Button>
          <div className="relative flex w-xl">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
            <Input className="pl-8 h-9 bg-white text-sm" placeholder="Search" />
          </div>
          <div className="scale-95">
            <MapFeatures/>
          </div>
        </div>

        {/* Add Charging Station */}
        <Button className="absolute bottom-10 left-10 bg-white hover:bg-gray-100 text-black flex items-center gap-2 pl-2 pr-4 z-10">
          <div className="bg-[#14213d] rounded-full p-1 mr-1">
            <PlusIcon className="h-4 w-4 text-white" />
          </div>
          Add a Charging Station
        </Button>
      </div>
    </div>
  )
}
