"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FaMapMarkerAlt, FaSearch, FaPlus, FaCrosshairs } from "react-icons/fa"
import { MapFeatures } from "@/app/map/mapfeats"
import ChargingMap from "@/app/map/ChargingMap"
import Navbar from "@/components/navbar"
import CreateStationModal from "@/app/map/CreateStationModal"
import { StationAPI } from '@/lib/api'

// Import types from centralized location
import type { ChargingStation, FilterCriteria } from '@/types'

export default function MapPage() {
  const [mapZoom] = useState(14)
  const [center, setCenter] = useState<[number, number]>([40.623361, -8.650256])
  const [stations, setStations] = useState<ChargingStation[]>([])
  const [filteredStations, setFilteredStations] = useState<ChargingStation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterCriteria | null>(null)
  const [totalStationCount, setTotalStationCount] = useState<number>(0)
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null)
  
  // Autocomplete states
  const [autocompleteResults, setAutocompleteResults] = useState<ChargingStation[]>([])
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [searching, setSearching] = useState(false)
  
  // Pinpoint mode state
  const [isPinpointMode, setIsPinpointMode] = useState(false)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in kilometers
  }, [])

  // Debounced autocomplete search
  const debouncedAutocompleteSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setAutocompleteResults([])
      setShowAutocomplete(false)
      return
    }

    try {
      const results = await StationAPI.searchStations({
        name: query
      })
      setAutocompleteResults(results.slice(0, 5)) // Limit to 5 suggestions
      setShowAutocomplete(true)
      setSelectedSuggestionIndex(-1)
    } catch (error) {
      console.error('Error in autocomplete search:', error)
      setAutocompleteResults([])
      setShowAutocomplete(false)
    }
  }, [])

  // Handle search input change with debouncing
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value)
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    // Set new timeout for autocomplete
    debounceTimeoutRef.current = setTimeout(() => {
      debouncedAutocompleteSearch(value)
    }, 300) // 300ms debounce
  }

  const handleAutocompleteSelect = (selectedStation: ChargingStation) => {
    setSearchQuery(selectedStation.name)
    setShowAutocomplete(false)
    setAutocompleteResults([])
    
    // Center map on selected station and show only this station
    const stationCoords: [number, number] = [selectedStation.latitude, selectedStation.longitude]
    setSearchCenter(stationCoords)
    setCenter(stationCoords)
    
    // Show only the selected station
    setFilteredStations([selectedStation])
    
    // Clear any search query to avoid confusion
    setSearchQuery(selectedStation.name)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showAutocomplete && selectedSuggestionIndex >= 0 && autocompleteResults[selectedSuggestionIndex]) {
        e.preventDefault()
        handleAutocompleteSelect(autocompleteResults[selectedSuggestionIndex])
      } else {
        handleSearch()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (showAutocomplete) {
        setSelectedSuggestionIndex(prev => 
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (showAutocomplete) {
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  const handleInputFocus = () => {
    if (searchQuery.trim().length >= 2 && autocompleteResults.length > 0) {
      setShowAutocomplete(true)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding autocomplete to allow for click events
    setTimeout(() => {
      setShowAutocomplete(false)
      setSelectedSuggestionIndex(-1)
    }, 200)
  }

  // Get user's current location
  const requestUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const userCoords: [number, number] = [latitude, longitude]
          console.log('User location obtained:', userCoords)
          setUserLocation(userCoords)
          setCenter(userCoords) // Center map on user's location
          setLoading(false)
        },
        (error) => {
          console.error('Error getting user location:', error)
          setError('Unable to get your location. Please enable location services.')
          // set user location to default location
          setUserLocation([40.623361, -8.650256])
          setCenter([40.623361, -8.650256])
          setLoading(false)
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }, [])

  // Initial location request
  useEffect(() => {
    requestUserLocation()
  }, [requestUserLocation])

  // Fetch stations from the backend
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use search center if available, otherwise user location, otherwise default center
        const [lat, lng] = searchCenter || userLocation || center
        const radius = filters?.maxDistance || 25 // Use filter radius or default 25km
        
        const stationsData = await StationAPI.getNearbyStations(lat, lng, radius)
        setStations(stationsData)
        setFilteredStations(stationsData) // Initialize filtered stations
      } catch (err) {
        console.error('Failed to fetch stations:', err)
        setError('Failed to load charging stations. Please try again later.')
        // Fallback to mock data if API fails
        const fallbackStations = [
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
        ]
        setStations(fallbackStations)
        setFilteredStations(fallbackStations)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch stations when we have a location (search center, user's, or default)
    if (searchCenter || userLocation || center) {
      fetchStations()
    }
  }, [searchCenter, userLocation, center, filters?.maxDistance]) // Re-fetch when search center, location or radius changes

  // Apply filters to stations
  useEffect(() => {
    if (!filters) {
      setFilteredStations(stations)
      return
    }

    const filtered = stations.filter(station => {
      // Connector type filter
      if (filters.connectorTypes.length > 0) {
        if (!filters.connectorTypes.includes(station.connectorType)) {
          return false
        }
      }

      // Power range filter
      if (station.power !== null && station.power !== undefined) {
        if (station.power < filters.minPower || station.power > filters.maxPower) {
          return false
        }
      }

      // Note: Distance filter is now handled by the backend getNearbyStations endpoint
      // No need to filter by distance here since the backend already returns stations within the radius

      return true
    })

    setFilteredStations(filtered)
  }, [stations, filters, userLocation, calculateDistance])

  // Memoized filter change handler
  const handleFiltersChange = useCallback((newFilters: FilterCriteria) => {
    setFilters(newFilters)
  }, [])

  const handleStationCreated = (newStation: ChargingStation) => {
    setStations(prev => [...prev, newStation])
    // Optionally center map on new station
    setCenter([newStation.latitude, newStation.longitude])
  }

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredStations(stations)
      setShowAutocomplete(false)
      return
    }

    try {
      setSearching(true)
      setShowAutocomplete(false)
      const searchResults = await StationAPI.searchStations({
        name: searchQuery
      })
      setFilteredStations(searchResults)
    } catch (err) {
      console.error('Search failed:', err)
      setError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const handleNearestStations = () => {
    // Use search center (pinpoint) if available, otherwise user location
    const referenceLocation = searchCenter || userLocation
    
    if (!referenceLocation) {
      setError('Location not available. Please enable location services or set a pinpoint.')
      return
    }

    // Find the closest station to reference location
    if (stations.length === 0) {
      setError('No stations available to search.')
      return
    }

    // Use all stations, not just filtered ones, to find the true nearest
    const stationsWithDistance = stations.map(station => ({
      ...station,
      distance: calculateDistance(
        referenceLocation[0], referenceLocation[1],
        station.latitude, station.longitude
      )
    }))

    const sortedStations = stationsWithDistance.sort((a, b) => a.distance - b.distance)
    const nearestStation = sortedStations[0]

    if (nearestStation) {
      // Center map on the nearest station
      setCenter([nearestStation.latitude, nearestStation.longitude])
      // Keep the current search center if it exists, otherwise set to reference location
      if (!searchCenter) {
        setSearchCenter(referenceLocation)
      }
      // Show only the nearest station
      setFilteredStations([nearestStation])
      
      // Clear search query
      setSearchQuery('')
    }
  }

  // Toggle pinpoint mode
  const handleTogglePinpointMode = () => {
    setIsPinpointMode(!isPinpointMode)
    if (!isPinpointMode && userLocation) {
      // When activating pinpoint mode, set initial search center to user location if none exists
      if (!searchCenter) {
        setSearchCenter(userLocation)
      }
    }
    // When deactivating, keep the search center (don't clear it)
  }

  // Handle search center change from map interaction (only when in pinpoint mode)
  const handleSearchCenterChange = (lat: number, lng: number) => {
    if (isPinpointMode) {
      const newSearchCenter: [number, number] = [lat, lng]
      setSearchCenter(newSearchCenter)
      setCenter(newSearchCenter)
    }
  }

  // Fetch total station count
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const count = await StationAPI.getTotalStationCount()
        setTotalStationCount(count)
      } catch (err) {
        console.error('Failed to fetch total station count:', err)
        // Don't set error for this, just log it
      }
    }

    fetchTotalCount()
  }, [])

  // Handle setting search center to current user location
  const handleSetSearchCenterToUserLocation = () => {
    if (userLocation) {
      setSearchCenter(userLocation)
      setCenter(userLocation) // Also center the map
    } else {
      setError('Location not available. Please enable location services.')
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

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
            <button 
              onClick={() => setError(null)}
              className="absolute top-1 right-2 text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Map starts below navbar */}
        <div className="absolute inset-0 z-0">
          <ChargingMap 
            zoom={mapZoom}
            center={center}
            stations={filteredStations}
            searchCenter={searchCenter}
            searchRadius={filters?.maxDistance || 25}
            onSearchCenterChange={handleSearchCenterChange}
            isPinpointMode={isPinpointMode}
          />
        </div>

        {/* Search and controls floating over map */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 py-3 px-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-md z-10">
          <Button 
            variant="outline" 
            className="flex items-center gap-1 bg-white hover:bg-gray-100 z-10 h-9"
            onClick={handleNearestStations}
            disabled={!userLocation}
          >
            <FaMapMarkerAlt className="h-3.5 w-3.5" />
            <span className="text-sm">Nearest</span>
          </Button>
          
          <Button 
            variant="outline" 
            className={`flex items-center gap-1 h-9 z-10 ${
              isPinpointMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white text-black hover:bg-gray-100'
            }`}
            onClick={handleTogglePinpointMode}
          >
            <FaCrosshairs className="h-3.5 w-3.5" />
            <span className="text-sm">Pinpoint</span>
          </Button>
          
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <FaSearch className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
              <Input 
                ref={searchInputRef}
                className="pl-8 h-9 bg-white text-sm w-64" 
                placeholder="Search stations..." 
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                autoComplete="off"
              />
              
              {/* Autocomplete Dropdown */}
              {showAutocomplete && autocompleteResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-30 max-h-60 overflow-y-auto">
                  {autocompleteResults.map((result, index) => (
                    <div
                      key={result.id}
                      className={`p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                        index === selectedSuggestionIndex ? 'bg-gray-100' : ''
                      }`}
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur
                      onClick={() => handleAutocompleteSelect(result)}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    >
                      <div className="text-black">
                        <div className="font-medium text-sm">
                          {result.externalId || result.id} - {result.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {result.address}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <span>{result.power || 'N/A'} kW • {result.connectorType}</span>
                          <span className={`px-1 py-0.5 rounded text-xs ${
                            result.isOperational ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {result.isOperational ? 'Operational' : 'Out of Service'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 bg-white hover:bg-gray-100"
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
            >
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>
          <div className="scale-95">
            <MapFeatures 
              onLocationRequest={handleSetSearchCenterToUserLocation}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </div>

        {/* Station count indicator */}
        <div className="absolute top-20 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md z-10">
          <p className="text-sm text-gray-700">
            Showing {filteredStations.length} of {totalStationCount > 0 ? totalStationCount : stations.length} stations
            {userLocation && (
              <span className="ml-1 text-blue-600">
                within {filters?.maxDistance || 25}km
              </span>
            )}
            {filters && Object.values(filters).some(v => 
              Array.isArray(v) ? v.length > 0 : 
              (v !== (filters?.maxDistance || 25) && v !== filters.maxDistance)
            ) && (
              <span className="ml-2 text-orange-600">(filtered)</span>
            )}
          </p>
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
