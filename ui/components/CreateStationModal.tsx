"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import { type ChargingStation } from "./LeafletMap"
import { StationAPI } from "@/lib/api"

interface CreateStationModalProps {
  isOpen: boolean
  onClose: () => void
  onStationCreated: (station: ChargingStation) => void
  defaultLocation?: { lat: number; lng: number }
}

export default function CreateStationModal({ 
  isOpen, 
  onClose, 
  onStationCreated, 
  defaultLocation 
}: CreateStationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "Portugal",
    latitude: defaultLocation?.lat || 40.623361,
    longitude: defaultLocation?.lng || -8.650256,
    connectorType: "Type 2",
    power: 22,
    isOperational: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const newStation = await StationAPI.createStation({
        ...formData,
      })
      onStationCreated(newStation)
      onClose()
      // Reset form
      setFormData({
        name: "",
        address: "",
        city: "",
        country: "Portugal",
        latitude: defaultLocation?.lat || 40.623361,
        longitude: defaultLocation?.lng || -8.650256,
        connectorType: "Type 2",
        power: 22,
        isOperational: true
      })
    } catch (err) {
      console.error('Failed to create station:', err)
      setError('Failed to create charging station. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-[#14213d]">Add Charging Station</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Station Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Station Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Mercadona Charging"
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="e.g., Rua da Liberdade 123"
              required
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="e.g., Aveiro"
              required
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="e.g., Portugal"
            />
          </div>

          {/* Location Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                  handleInputChange('latitude', isNaN(value) ? 0 : value)
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                  handleInputChange('longitude', isNaN(value) ? 0 : value)
                }}
                required
              />
            </div>
          </div>

          {/* Connector Type */}
          <div className="space-y-2">
            <Label htmlFor="connectorType">Connector Type</Label>
            <Select value={formData.connectorType} onValueChange={(value) => handleInputChange('connectorType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Type 2">Type 2</SelectItem>
                <SelectItem value="CCS">CCS</SelectItem>
                <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
                <SelectItem value="Tesla">Tesla</SelectItem>
                <SelectItem value="Type 1">Type 1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Power */}
          <div className="space-y-2">
            <Label htmlFor="power">Power (kW)</Label>
            <Input
              id="power"
              type="number"
              value={formData.power}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value)
                handleInputChange('power', isNaN(value) ? 0 : value)
              }}
              placeholder="e.g., 22"
            />
          </div>

          {/* Operational Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOperational"
              checked={formData.isOperational}
              onCheckedChange={(checked) => handleInputChange('isOperational', !!checked)}
            />
            <Label htmlFor="isOperational">Station is operational</Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#14213d] hover:bg-[#14213d]/90"
            >
              {isSubmitting ? "Creating..." : "Create Station"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 