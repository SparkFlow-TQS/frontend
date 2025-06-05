"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaMapPin, FaClock, FaRedo, FaSearch } from "react-icons/fa"
import { Calendar } from "@/components/ui/calendar"
import Navbar from "@/components/navbar"
import { type ChargingStation } from "@/types"
import { StationAPI } from "@/lib/api"

export default function SchedulePage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
    const [repeatOption, setRepeatOption] = useState("none")
    const [station, setStation] = useState<ChargingStation | null>(null)
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<ChargingStation[]>([])
    const [searching, setSearching] = useState(false)
    const [autocompleteResults, setAutocompleteResults] = useState<ChargingStation[]>([])
    const [showAutocomplete, setShowAutocomplete] = useState(false)
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
    const searchParams = useSearchParams()
    const searchInputRef = useRef<HTMLInputElement>(null)
    const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

    // Time slot options
    const timeSlots = [
        "08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30", "09:30 - 10:00",
        "10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30", "11:30 - 12:00",
        "12:00 - 12:30", "12:30 - 13:00", "13:00 - 13:30", "13:30 - 14:00",
        "14:00 - 14:30", "14:30 - 15:00", "15:00 - 15:30", "15:30 - 16:00",
        "16:00 - 16:30", "16:30 - 17:00", "17:00 - 17:30", "17:30 - 18:00",
        "18:00 - 18:30", "18:30 - 19:00", "19:00 - 19:30", "19:30 - 20:00"
    ]

    // Repeat options
    const repeatOptions = [
        { value: "none", label: "Does not repeat" },
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" }
    ]

    useEffect(() => {
        const loadStationData = async () => {
            try {
                const stationId = searchParams.get('stationId')
                const stationData = searchParams.get('stationData')
                
                if (stationId) {
                    setLoading(true)
                    // Fetch station by ID from API
                    const stationFromAPI = await StationAPI.getStationById(parseInt(stationId))
                    setStation(stationFromAPI)
                } else if (stationData) {
                    // Parse station data from URL parameters
                    const parsedStation = JSON.parse(decodeURIComponent(stationData))
                    setStation(parsedStation)
                }
                // No default fallback - user must search or come from map
            } catch (error) {
                console.error('Error loading station data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadStationData()
    }, [searchParams])

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

    const handleSearch = async () => {
        if (!searchQuery.trim()) return
        
        setSearching(true)
        setShowAutocomplete(false)
        try {
            // Search with the query as name - backend will handle the filtering properly
            const results = await StationAPI.searchStations({
                name: searchQuery
            })
            setSearchResults(results)
        } catch (error) {
            console.error('Error searching stations:', error)
            setSearchResults([])
        } finally {
            setSearching(false)
        }
    }

    const handleSelectStation = (selectedStation: ChargingStation) => {
        setStation(selectedStation)
        setSearchResults([])
        setSearchQuery("")
        setShowAutocomplete(false)
    }

    const handleAutocompleteSelect = (selectedStation: ChargingStation) => {
        setStation(selectedStation)
        setSearchQuery(selectedStation.name)
        setShowAutocomplete(false)
        setAutocompleteResults([])
        setSearchResults([])
    }

    const handleNavigate = () => {
        if (station && typeof window !== 'undefined') {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`, '_blank')
        }
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

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [])

    // Format date for display
    const formatDate = (date: Date | undefined) => {
        if (!date) return "Select a date"
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }

    if (loading) {
        return (
            <div className="flex h-screen flex-col w-screen overflow-hidden">
                <header>
                    <Navbar />
                </header>
                <main className="h-screen flex flex-col bg-[#14213d] flex-1 p-4 md:p-6 items-center justify-center">
                    <div className="text-white text-lg">Loading station data...</div>
                </main>
            </div>
        )
    }

    // Show search interface if no station is selected
    if (!station) {
        return (
            <div className="flex h-screen flex-col w-screen overflow-hidden">
                <header>
                    <Navbar />
                </header>
                <main className="h-screen flex flex-col bg-[#14213d] flex-1 p-4 md:p-6 ">
                    <div className="max-w-2xl mx-auto text-white w-full">
                        <h1 className="text-3xl font-bold text-center mb-8">Schedule Charging Session</h1>
                        
                        {/* Search Interface with Autocomplete */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Search for a Charging Station</h2>
                            <div className="flex gap-3 relative">
                                <div className="relative flex-1">
                                    <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
                                    <Input
                                        ref={searchInputRef}
                                        className="pl-10 bg-white text-black"
                                        placeholder="Search by station name..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearchInputChange(e.target.value)}
                                        onKeyDown={handleKeyPress}
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
                                    onClick={handleSearch}
                                    disabled={searching || !searchQuery.trim()}
                                    className="bg-[#FFA500] hover:bg-[#FFA500]/90 text-black font-semibold"
                                >
                                    {searching ? "Searching..." : "Search"}
                                </Button>
                            </div>
                        </div>

                        {/* Search Results - Only show if not using autocomplete */}
                        {!showAutocomplete && searchResults.length > 0 && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Search Results</h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {searchResults.map((result) => (
                                        <div 
                                            key={result.id}
                                            className="bg-white/20 rounded-lg p-4 cursor-pointer hover:bg-white/30 transition-colors"
                                            onClick={() => handleSelectStation(result)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg">
                                                        {result.externalId || result.id} - {result.name}
                                                    </h4>
                                                    <p className="text-sm opacity-90">{result.address}</p>
                                                    <p className="text-sm opacity-90">{result.city}, {result.country}</p>
                                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                                        <span>{result.power || 'N/A'} kW • {result.connectorType}</span>
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            result.isOperational ? 'bg-green-600' : 'bg-red-600'
                                                        }`}>
                                                            {result.isOperational ? 'Operational' : 'Out of Service'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm"
                                                    className="bg-[#FFA500] hover:bg-[#FFA500]/90 text-black"
                                                >
                                                    Select
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No results message - Only show if searched and not using autocomplete */}
                        {!showAutocomplete && !searching && searchQuery && searchResults.length === 0 && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                                <p className="text-lg">No stations found for &ldquo;{searchQuery}&rdquo;</p>
                                <p className="text-sm opacity-75 mt-2">Try searching with different keywords or check the spelling.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col w-screen overflow-hidden">
            <header>
                <Navbar />
            </header>
            <main className="h-screen flex flex-col bg-[#14213d] flex-1 p-4 md:p-6 ">
                {/* Back to search button */}
                <div className="w-full mb-4 px-8 flex justify-start">
                    <Button 
                        variant="outline" 
                        onClick={() => setStation(null)}
                        className="text-white border-white bg-[#FFA500]  hover:text-[#14213d]"
                    >
                        ← Search Different Station
                    </Button>
                </div>

                {/* Vertically centered container for the 3-column grid */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-8 text-white justify-center ">
                    {/* Station Info */}
                        <div className="space-y-6 md:border-r md:border-white md:border-opacity-30 md:pr-8 flex-1 flex flex-col items-center">
                            <div className="text-center">
                                <h2 className="text-6xl font-bold mb-22">Station</h2>
                                <h3 className="text-xl font-semibold text-[#FFA500] mt-2">
                                    {station.externalId || station.id} - {station.name}
                                </h3>
                                <p className="mt-1">{station.city}</p>

                                <Button 
                                    variant="outline" 
                                    className="mt-4 flex items-center gap-2 bg-[#FFA500] text-white hover:text-[#14213d] mx-auto"
                                    onClick={handleNavigate}
                                >
                                <FaMapPin className="h-5 w-5" />
                                NAVIGATE
                            </Button>
                        </div>

                            <div className="text-center">
                            <h2 className="text-2xl font-bold">Equipment Details</h2>
                            <p className="mt-2">Number of Stations/Bays: 1</p>

                                <div className="mt-4 flex items-start gap-4 justify-center">
                                <div className="bg-gray-800 p-3 rounded-full">
                                    {/* Charging connector icon */}
                                    <div className="h-10 w-10 flex items-center justify-center">
                                        <div className="border-2 border-[#FFA500] rounded-full h-8 w-8 flex items-center justify-center">
                                            <div className="bg-[#FFA500] h-3 w-3 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                    <div className="text-left">
                                        <p className="text-[#FFA500] font-semibold">{station.connectorType}</p>
                                        <p className="font-semibold">{station.power || 'N/A'} kW</p>
                                    <p>AC (Three-Phase)</p>
                                    <p>32A 400V</p>
                                </div>
                            </div>

                                <div className="mt-6 flex items-center justify-center">
                                <span className="text-[#FFA500] font-bold text-xl">1 ×</span>
                                    <span className={`ml-2 text-sm px-2 py-0.5 rounded ${
                                        station.isOperational ? 'bg-green-800' : 'bg-red-800'
                                    }`}>
                                        {station.isOperational ? 'Operational' : 'Out of Service'}
                                    </span>
                            </div>
                        </div>
                    </div>

                    {/* Calendar column*/}
                        <div className="flex flex-col space-y-4 items-center justify-center text-center w-full md:border-r md:border-white md:border-opacity-30 md:pr-8 flex-1">
                            <h1 className="text-6xl mb-22 font-bold text-center ">Select a Date & Time</h1>
                        <div className="bg-white flex flex-col text-[#14213d] rounded-lg p-2 items-center justify-center w-fit ">
                            <Calendar
                                className="rounded-md text-lg"
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                classNames={{
                                    today: "bg-[#FFA500] text-white",
                                    selected: "bg-[#14213d] text-white font-bold",
                                    weekday: "text-[#14213d] font-bold text-center mx-2",
                                    day: "h-10 w-10 p-0 hover:bg-gray-100 cursor-pointer",
                                    month_grid: "w-full border-collapse",
                                    nav_button: "h-8 w-8 bg-transparent p-0 hover:bg-gray-100 text-[#14213d]",
                                }}
                            />
                        </div>
                    </div>

                    {/* Time Selection */}
                        <div className="space-y-6 flex-1 flex flex-col items-center">
                            <div className="text-center">
                                <h2 className="text-6xl mb-22 font-bold text-[#FFA500]">{formatDate(date)}</h2>

                                <div className="mt-6 space-y-4 flex flex-col items-center">
                                <div className="flex items-center gap-2">
                                    <FaClock className="h-6 w-6" />
                                        <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                                            <SelectTrigger className="w-64 bg-white border-2 border-[#FFA500] text-[#14213d] font-bold">
                                                <SelectValue placeholder="Select time slot" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeSlots.map((slot) => (
                                                    <SelectItem key={slot} value={slot}>
                                                        {slot}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FaRedo className="h-6 w-6" />
                                        <Select value={repeatOption} onValueChange={setRepeatOption}>
                                            <SelectTrigger className="w-64 bg-white text-[#14213d] font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {repeatOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Schedule Button */}
                                <div className="mt-8">
                                    <Button 
                                        className="bg-[#FFA500] hover:bg-[#FFA500]/90 text-black font-bold py-3 px-8 text-lg"
                                        disabled={!selectedTimeSlot || !date}
                                    >
                                        Schedule Charging Session
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
