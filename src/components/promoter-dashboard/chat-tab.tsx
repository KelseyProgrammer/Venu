"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2 } from "lucide-react"
import { getMyLocations } from "./data"
import { RealTimeChat } from "@/components/real-time-chat"
import { usePromoterRealTime } from "@/hooks/usePromoterRealTime"

interface ChatTabProps {
  selectedLocation: string;
}

export function ChatTab({ selectedLocation }: ChatTabProps) {
  const myLocations = getMyLocations()
  const { isConnected, error } = usePromoterRealTime({ 
    promoterId: "promoter-123", 
    selectedLocation 
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Venue Chat</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {selectedLocation === "all" ? "All Venues" : myLocations.find(v => v.id === selectedLocation)?.name}
          </Badge>
          {!isConnected && (
            <Badge variant="destructive" className="text-xs">
              Disconnected
            </Badge>
          )}
        </div>
      </div>

      {/* Real-time Chat Component */}
      <div className="space-y-4">
        {selectedLocation === "all" ? (
          <Card className="p-4 bg-card border-border">
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Select a Venue</h3>
              <p className="text-sm text-muted-foreground">
                Choose a specific venue from the location filter to view venue-specific chat messages.
              </p>
            </div>
          </Card>
        ) : (
          <RealTimeChat 
            locationId={selectedLocation} 
            currentUserId="promoter-123"
            className="h-96"
          />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}
    </div>
  )
}
