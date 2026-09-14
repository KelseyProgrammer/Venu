"use client"

import { memo } from "react"
import { Card } from "@/components/ui/card"
import { MapPin, Building2 } from "lucide-react"
import { Venue } from "./types"

interface LocationCardProps {
  location: Venue;
  onClick?: () => void;
}

export const LocationCard = memo(function LocationCard({ location, onClick }: LocationCardProps) {
  return (
    <Card
      className="p-4 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{location.name}</h4>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {location.location}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Capacity:</span>
          <span className="text-foreground font-medium">{location.capacity}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Events:</span>
          <span className="text-foreground font-medium">{location.eventsCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Revenue:</span>
          <span className="text-green-400 font-medium">${location.revenue.toLocaleString()}</span>
        </div>
      </div>
    </Card>
  )
})
