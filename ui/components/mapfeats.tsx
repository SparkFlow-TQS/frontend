"use client"
import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

import { AiOutlineAim } from "react-icons/ai";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";

export function MapFeatures() {
    const [connectorFilters, setConnectorFilters] = useState({
        type2: false,
        chademo: false
    });
    const [powerValue, setPowerValue] = useState(20);
    const [priceValue, setPriceValue] = useState(33);
    const [distanceValue, setDistanceValue] = useState(33);

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

    const toggleConnector = (connector: string, e: React.MouseEvent) => {
        // Prevent menu from closing
        e.preventDefault();
        e.stopPropagation();
        
        setConnectorFilters(prev => ({
            ...prev,
            [connector]: !prev[connector as keyof typeof connectorFilters]
        }));
    };

    return (
        <Menubar className="z-10">
            <MenubarMenu>
                <MenubarTrigger>{features[0].icon}</MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>{features[1].icon}</MenubarTrigger>
                <MenubarContent className="w-64">
                    <MenubarItem className="flex flex-col items-start" onSelect={(e) => e.preventDefault()}>
                        <div className="flex justify-between w-full mb-2">
                            <span>Price</span>
                            <span className="text-sm font-medium">{priceValue}€</span>
                        </div>
                        <Slider 
                            value={[priceValue]} 
                            onValueChange={(val) => setPriceValue(val[0])} 
                            max={100} 
                            min={20} 
                            step={1} 
                            className="w-full" 
                        />
                    </MenubarItem>
                    <MenubarItem className="flex flex-col items-start" onSelect={(e) => e.preventDefault()}>
                        <div className="flex justify-between w-full mb-2">
                            <span>Distance</span>
                            <span className="text-sm font-medium">{distanceValue} km</span>
                        </div>
                        <Slider 
                            value={[distanceValue]} 
                            onValueChange={(val) => setDistanceValue(val[0])} 
                            max={100} 
                            min={1} 
                            step={1} 
                            className="w-full" 
                        />
                    </MenubarItem>
                    <MenubarSub>
                        <MenubarSubTrigger>Connector Type</MenubarSubTrigger>
                        <MenubarSubContent>
                            <div 
                                onClick={(e) => toggleConnector('type2', e)}
                                className="block w-full"
                            >
                                <MenubarCheckboxItem 
                                    checked={connectorFilters.type2}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    Type 2
                                </MenubarCheckboxItem>
                            </div>
                            <div 
                                onClick={(e) => toggleConnector('chademo', e)}
                                className="block w-full"
                            >
                                <MenubarCheckboxItem 
                                    checked={connectorFilters.chademo}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    CHAdeMO
                                </MenubarCheckboxItem>
                            </div>
                            <MenubarSeparator />
                            <MenubarItem 
                                className="flex flex-col items-start"
                                onSelect={(e) => e.preventDefault()}
                            >
                                <div className="flex justify-between w-full mb-2">
                                    <span>Power</span>
                                    <span className="text-sm font-medium">{powerValue} kW</span>
                                </div>
                                <Slider 
                                    value={[powerValue]} 
                                    onValueChange={(val) => setPowerValue(val[0])} 
                                    max={120} 
                                    min={12} 
                                    step={1} 
                                    className="w-full" 
                                />
                            </MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}
