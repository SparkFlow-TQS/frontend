"use client"

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FaMapPin, FaSearch, FaBolt, FaExclamationTriangle, FaCheck, FaSync } from "react-icons/fa"
import { Calendar } from "@/components/ui/calendar"
import Navbar from "@/components/navbar"
import { type ChargingStation } from "@/types"
import { StationAPI } from "@/lib/api"
import { ReservationManager } from "@/lib/reservations"

function SchedulePageContent() {
    const [date, setDate] = useState<Date | undefined>(new Date())
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

    // Reservation-specific state
    const [timeRange, setTimeRange] = useState<number[]>([8 * 60, 10 * 60]) // [startMinutes, endMinutes] from midnight
    const [chargerCount, setChargerCount] = useState<number>(1)
    const [repeatOption, setRepeatOption] = useState<string>("none")
    const [availability, setAvailability] = useState<{ time: string; availableChargers: number; totalChargers: number; isBlocked: boolean }[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Repeat options
    const repeatOptions = [
        { value: "none", label: "No Repeat" },
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

    // Check availability when parameters change
    useEffect(() => {
        if (!station || !date) return

        const selectedDateObj = new Date(date)
        const dayAvailability = ReservationManager.getStationAvailability(
            station.id,
            selectedDateObj,
            station.quantityOfChargers
        )
        setAvailability(dayAvailability.timeSlots)
    }, [station, date, timeRange, chargerCount])

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
        // Reset charger count to fit within station limits
        setChargerCount(Math.min(chargerCount, selectedStation.quantityOfChargers))
    }

    const handleAutocompleteSelect = (selectedStation: ChargingStation) => {
        setStation(selectedStation)
        setSearchQuery(selectedStation.name)
        setShowAutocomplete(false)
        setAutocompleteResults([])
        setSearchResults([])
        // Reset charger count to fit within station limits
        setChargerCount(Math.min(chargerCount, selectedStation.quantityOfChargers))
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

    // Create time slot from current parameters
    const createTimeSlot = useCallback(() => {
        if (!date) return null
        
        const selectedDate = new Date(date)
        const start = new Date(selectedDate)
        start.setHours(Math.floor(timeRange[0] / 60), timeRange[0] % 60, 0, 0)
        const end = new Date(selectedDate)
        end.setHours(Math.floor(timeRange[1] / 60), timeRange[1] % 60, 0, 0)
        
        return { start, end }
    }, [date, timeRange])

    // Check if current time slot is blocked
    const isTimeSlotBlocked = (): boolean => {
        const startHour = Math.floor(timeRange[0] / 60)
        const endHour = Math.floor(timeRange[1] / 60)
        
        const availableInRange = availability.filter(slot => {
            const hour = parseInt(slot.time.split(':')[0])
            return hour >= startHour && hour <= endHour
        })
        
        return availableInRange.some(slot => slot.availableChargers < chargerCount)
    }

    // Handle reservation submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!station || !date) return
        
        setIsSubmitting(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const timeSlot = createTimeSlot()
            if (!timeSlot) {
                throw new Error('Please select a valid date')
            }
            
            // Validate time slot
            if (timeSlot.start >= timeSlot.end) {
                throw new Error('End time must be after start time')
            }

            if (timeSlot.start <= new Date()) {
                throw new Error('Reservation time must be in the future')
            }

            // Check availability
            const availabilityCheck = ReservationManager.checkAvailability(
                station.id,
                timeSlot,
                station.quantityOfChargers
            )

            if (availabilityCheck.availableChargers < chargerCount) {
                throw new Error(`Only ${availabilityCheck.availableChargers} chargers available for this time slot`)
            }

            // Create reservation
            const reservation = ReservationManager.createReservation(
                {
                    stationId: station.id,
                    timeSlot,
                    chargerCount
                },
                station.name
            )

            setSuccessMessage(`Reservation created successfully! Reservation ID: ${reservation.id}`)
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create reservation')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Format time for display (minutes from midnight to HH:MM)
    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    }

    // Parse time string (HH:MM) to minutes from midnight
    const parseTime = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(num => parseInt(num) || 0)
        return hours * 60 + minutes
    }

    // Validate and update start time from input
    const handleStartTimeChange = (value: string) => {
        const minutes = parseTime(value)
        if (minutes >= 6 * 60 && minutes <= 23 * 60 && minutes < timeRange[1]) {
            setTimeRange([minutes, timeRange[1]])
        }
    }

    // Validate and update end time from input
    const handleEndTimeChange = (value: string) => {
        const minutes = parseTime(value)
        if (minutes >= 6 * 60 && minutes <= 23 * 60 && minutes > timeRange[0]) {
            setTimeRange([timeRange[0], minutes])
        }
    }

    // Calculate duration in hours and minutes
    const getDuration = (): string => {
        const totalMinutes = timeRange[1] - timeRange[0]
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        
        if (hours === 0) {
            return `${minutes}min`
        } else if (minutes === 0) {
            return `${hours}h`
        } else {
            return `${hours}h ${minutes}min`
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
                                                            <span>{result.power || 'N/A'} kW • {result.quantityOfChargers} {result.quantityOfChargers === 1 ? 'charger' : 'chargers'}</span>
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
                                                        <span>{result.power || 'N/A'} kW • {result.quantityOfChargers} {result.quantityOfChargers === 1 ? 'charger' : 'chargers'}</span>
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

    const timeSlotBlocked = isTimeSlotBlocked()
    const durationMinutes = timeRange[1] - timeRange[0]
    const estimatedCost = (durationMinutes / 60) * chargerCount * 25 * 0.35 // rough calculation

    return (
        <div className="flex h-screen flex-col w-screen overflow-hidden">
            <header>
                <Navbar />
            </header>
            <main className="h-screen flex flex-col bg-[#14213d] flex-1 p-4 md:p-6 overflow-y-auto">
                {/* Back to search button */}
                <div className="w-full mb-4 px-8 flex justify-start">
                    <Button 
                        variant="outline" 
                        onClick={() => setStation(null)}
                        className="text-white border-white bg-[#FFA500] hover:text-[#14213d]"
                    >
                        ← Search Different Station
                    </Button>
                </div>

                <div className="max-w-6xl mx-auto text-white w-full">
                    <h1 className="text-4xl font-bold text-center mb-8">Make Reservation</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Station Info */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold text-[#FFA500]">
                                        {station.externalId || station.id} - {station.name}
                                    </h2>
                                    <p className="text-lg mt-1">{station.city} • {station.address}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-sm">{station.power || 'N/A'} kW</span>
                                        <span className="text-sm">{station.quantityOfChargers} {station.quantityOfChargers === 1 ? 'charger' : 'chargers'} available</span>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            station.isOperational ? 'bg-green-600' : 'bg-red-600'
                                        }`}>
                                            {station.isOperational ? 'Operational' : 'Out of Service'}
                                        </span>
                                    </div>
                                </div>
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    className="bg-[#FFA500] text-black hover:bg-[#FFA500]/90"
                                    onClick={handleNavigate}
                                >
                                    <FaMapPin className="h-4 w-4 mr-2" />
                                    Navigate
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Date Selection */}
                            <div className="space-y-6">
                                {/* Date Selection */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                                    <Label className="text-lg font-semibold mb-4 block">Select Date</Label>
                                    <div className="bg-white rounded-lg p-2 w-fit mx-auto text-[#14213d] items-center justify-center">
                                        <Calendar
                                            className="rounded-md text-lg"
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            disabled={(date) => date < new Date()}
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

                            </div>

                            {/* Middle Column - Time Selection */}
                            <div className="space-y-6">
                                {/* Time Slot Selection */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                                    <Label className="text-lg font-semibold mb-4 block">Select Time Slot</Label>
                                    
                                    {/* Time Range Slider */}
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between w-full mb-2">
                                            <span>Time Range</span>
                                            <span className="text-sm font-medium text-[#FFA500]">{formatTime(timeRange[0])} - {formatTime(timeRange[1])}</span>
                                        </div>
                                        
                                        {/* Time Input Fields */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <Label className="text-sm text-gray-300 mb-1 block">Start Time</Label>
                                                <Input
                                                    type="time"
                                                    value={formatTime(timeRange[0])}
                                                    onChange={(e) => handleStartTimeChange(e.target.value)}
                                                    min="06:00"
                                                    max="23:00"
                                                    className="bg-white text-black text-center"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm text-gray-300 mb-1 block">End Time</Label>
                                                <Input
                                                    type="time"
                                                    value={formatTime(timeRange[1])}
                                                    onChange={(e) => handleEndTimeChange(e.target.value)}
                                                    min="06:00"
                                                    max="23:00"
                                                    className="bg-white text-black text-center"
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Slider */}
                                        <Slider 
                                            value={timeRange} 
                                            onValueChange={setTimeRange} 
                                            max={23 * 60} // 11 PM in minutes
                                            min={6 * 60}  // 6 AM in minutes
                                            step={5}      // 5-minute increments
                                            className="w-full" 
                                        />
                                        
                                        <div className="text-sm text-center text-[#FFA500]">
                                            Duration: {getDuration()}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Right Column - Configuration */}
                            <div className="space-y-6">
                                {/* Repeat Options */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                                    <Label className="text-lg font-semibold mb-4 block">
                                        <FaSync className="inline mr-2" />
                                        Repeat Schedule
                                    </Label>
                                    <Select value={repeatOption} onValueChange={setRepeatOption}>
                                        <SelectTrigger className="bg-white text-black">
                                            <SelectValue placeholder="Select repeat option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {repeatOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {repeatOption !== "none" && (
                                        <p className="text-sm text-gray-300 mt-2">
                                            This reservation will repeat {repeatOption} until cancelled.
                                        </p>
                                    )}
                                </div>
                                {/* Cost Estimate */}
                                <div className="bg-blue-600/20 border border-blue-400 rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-lg font-semibold">Estimated Cost</span>
                                        <span className="text-2xl font-bold text-[#FFA500]">€{estimatedCost.toFixed(2)}</span>
                                    </div>
                                    <div className="text-sm opacity-90">
                                        {getDuration()} × {chargerCount} charger{chargerCount > 1 ? 's' : ''} × ~25 kWh × €0.35/kWh
                                    </div>
                                    {repeatOption !== "none" && (
                                        <div className="text-xs text-blue-200 mt-2">
                                            * Recurring {repeatOption} reservations
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="bg-red-600/20 border border-red-400 text-red-100 px-4 py-3 rounded flex items-center gap-2">
                                <FaExclamationTriangle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-600/20 border border-green-400 text-green-100 px-4 py-3 rounded flex items-center gap-2">
                                <FaCheck className="h-4 w-4" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Availability Warning */}
                        {timeSlotBlocked && (
                            <div className="bg-orange-600/20 border border-orange-400 text-orange-100 px-4 py-3 rounded flex items-center gap-2">
                                <FaExclamationTriangle className="h-4 w-4" />
                                <span>
                                    Selected time slot has limited availability. Some hours may not have enough chargers.
                                </span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="text-center">
                            <Button
                                type="submit"
                                className="bg-[#FFA500] hover:bg-[#FFA500]/90 text-black font-bold py-4 px-12 text-lg"
                                disabled={isSubmitting || timeSlotBlocked || !date || !station?.isOperational}
                                size="lg"
                            >
                                {isSubmitting ? (
                                    "Creating Reservation..."
                                ) : (
                                    <>
                                        <FaBolt className="h-5 w-5 mr-2" />
                                        Reserve {getDuration()} Charging Session
                                        {repeatOption !== "none" && (
                                            <span className="ml-2">({repeatOption})</span>
                                        )}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default function SchedulePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen flex-col w-screen overflow-hidden">
                <header>
                    <Navbar />
                </header>
                <main className="h-screen flex flex-col bg-[#14213d] flex-1 p-4 md:p-6 items-center justify-center">
                    <div className="text-white text-lg">Loading...</div>
                </main>
            </div>
        }>
            <SchedulePageContent />
        </Suspense>
    )
}

