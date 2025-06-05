"use client"

import React, { useEffect, useState } from 'react';
import { AiOutlineAim } from "react-icons/ai";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

// Import types from centralized location
import type { MapFeaturesProps, FilterCriteria } from '@/types'

export function MapFeatures({ onLocationRequest, onFiltersChange }: MapFeaturesProps) {
    const [powerValue, setPowerValue] = useState([22, 50]); // Min and max power
    const [priceValue, setPriceValue] = useState(50);
    const [distanceValue, setDistanceValue] = useState(25);

    const features = [
        {
            label: "My Location",
            icon: <AiOutlineAim className="h-4 w-4" />,
        },
        {
            label: "Filters",
            icon: <HiOutlineAdjustmentsHorizontal className="h-4 w-4" />,
        },
    ]

    // Update filters when any filter changes
    useEffect(() => {
        if (onFiltersChange) {
            const filterCriteria: FilterCriteria = {
                minPower: powerValue[0],
                maxPower: powerValue[1],
                maxPrice: priceValue,
                maxDistance: distanceValue
            };

            onFiltersChange(filterCriteria);
        }
    }, [ powerValue, priceValue, distanceValue, onFiltersChange]);

    const handleLocationClick = () => {
        if (onLocationRequest) {
            onLocationRequest();
        }
    };

    const clearFilters = () => {
        setPowerValue([22, 50]);
        setPriceValue(50);
        setDistanceValue(25);
    };

    return (
        <Menubar className="z-10">
            <MenubarMenu>
                <MenubarTrigger onClick={handleLocationClick}>
                    {features[0].icon}
                </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>{features[1].icon}</MenubarTrigger>
                <MenubarContent className="w-72">
                    {/* Distance Filter */}
                    <MenubarItem className="flex flex-col items-start" onSelect={(e) => e.preventDefault()}>
                        <div className="flex justify-between w-full mb-2">
                            <span>Search Radius</span>
                            <span className="text-sm font-medium">{distanceValue} km</span>
                        </div>
                        <Slider 
                            value={[distanceValue]} 
                            onValueChange={(val) => setDistanceValue(val[0])} 
                            max={600} 
                            min={1} 
                            step={1} 
                            className="w-full" 
                        />
                        <div className="text-xs text-gray-500 mt-1 text-center w-full">
                            Find stations within this radius from your location
                        </div>
                    </MenubarItem>

                    {/* Price Filter */}
                    <MenubarItem className="flex flex-col items-start" onSelect={(e) => e.preventDefault()}>
                        <div className="flex justify-between w-full mb-2">
                            <span>Max Price</span>
                            <span className="text-sm font-medium">€{priceValue}/kWh</span>
                        </div>
                        <Slider 
                            value={[priceValue]} 
                            onValueChange={(val) => setPriceValue(val[0])} 
                            max={100} 
                            min={10} 
                            step={1} 
                            className="w-full" 
                        />
                    </MenubarItem>

                    {/* Power Range Filter */}
                    <MenubarItem className="flex flex-col items-start" onSelect={(e) => e.preventDefault()}>
                        <div className="flex justify-between w-full mb-2">
                            <span>Power Range</span>
                            <span className="text-sm font-medium">{powerValue[0]} - {powerValue[1]} kW</span>
                        </div>
                        <Slider 
                            value={powerValue} 
                            onValueChange={setPowerValue} 
                            max={150} 
                            min={3} 
                            step={1} 
                            className="w-full" 
                        />
                    </MenubarItem>

                    <MenubarSeparator />
                    {/* Clear Filters Button */}
                    <MenubarItem onSelect={(e) => e.preventDefault()}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="w-full"
                        >
                            Clear All Filters
                        </Button>
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
}

// Re-export the FilterCriteria type for backward compatibility
export type { FilterCriteria } from '@/types'
