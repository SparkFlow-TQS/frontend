"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FaMapMarkerAlt, FaClock, FaRedo } from "react-icons/fa"
import { Calendar } from "@/components/ui/calendar"
import Navbar from "@/components/navbar"

export default function SchedulePage() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const selectedTimeSlot = "10:15am-10h45am"

    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate)
    }

    return (
        <div className="flex h-screen flex-col w-screen overflow-hidden">
            <header>
                <Navbar />
            </header>
            <main className="h-screen flex flex-col bg-[#14213d] flex-1 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-white">
                    {/* Station Info */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold">Station</h2>
                            <h3 className="text-xl font-semibold text-[#FFA500] mt-2">AVR-00023/24 - Mercadona</h3>
                            <p className="mt-1">Aveiro</p>
                            <p className="text-sm mt-1">Lat/Long: 40.623361, -8.650256</p>

                            <Button variant="outline" className="mt-4 flex items-center gap-2">
                                <FaMapMarkerAlt className="h-5 w-5" />
                                NAVIGATE
                            </Button>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold">Equipment Details</h2>
                            <p className="mt-2">Number of Stations/Bays: 1</p>

                            <div className="mt-4 flex items-start gap-4">
                                <div className="bg-gray-800 p-3 rounded-full">
                                    {/* Charging connector icon */}
                                    <div className="h-10 w-10 flex items-center justify-center">
                                        <div className="border-2 border-[#FFA500] rounded-full h-8 w-8 flex items-center justify-center">
                                            <div className="bg-[#FFA500] h-3 w-3 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[#FFA500] font-semibold">Type 2 (Socket Only)</p>
                                    <p className="font-semibold">22 kW</p>
                                    <p>AC (Three-Phase)</p>
                                    <p>32A 400V</p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center">
                                <span className="text-[#FFA500] font-bold text-xl">1 ×</span>
                                <span className="ml-2 text-sm bg-green-800 px-2 py-0.5 rounded">Operational</span>
                            </div>
                        </div>
                    </div>

                    {/* Calendar column*/}
                    <div className="flex flex-col space-y-4 items-center justify-center text-center w-full">
                        <h1 className="text-2xl font-bold text-center ">Select a Date & Time</h1>
                        <div className="bg-white flex flex-col text-[#14213d] rounded-lg items-center justify-center w-fit h-fit">
                            <Calendar
                                className="rounded-md text-lg"
                                selected={date}
                                onSelect={handleDateSelect}
                            />
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#FFA500]">Monday, May 22 2025</h2>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-2">
                                    <FaClock className="h-6 w-6" />
                                    <div className="bg-white border-2 border-[#FFA500] p-3 rounded text-[#14213d] font-bold">
                                        {selectedTimeSlot}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FaRedo className="h-6 w-6" />
                                    <div className="bg-white p-3 rounded text-[#14213d] font-bold">Does not repeat</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
