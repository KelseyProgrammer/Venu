"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, Users, Music, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import { GigProfile } from "@/lib/api"

interface EventDetailsModalProps {
  event: GigProfile | null
  isOpen: boolean
  onClose: () => void
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  if (!event) return null

  const progress = (event.ticketsSold / event.ticketCapacity) * 100

  // Helper function to convert 24-hour time to 12-hour format
  const formatTime12Hour = (time24: string): string => {
    try {
      // Handle various time formats
      const time = time24.trim()
      
      // If it's already in 12-hour format, return as is
      if (time.includes('AM') || time.includes('PM')) {
        return time
      }
      
      // If it's in 24-hour format (HH:MM), convert it
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours, 10)
        const minute = parseInt(minutes, 10)
        
        if (isNaN(hour) || isNaN(minute)) {
          return time24 // Return original if parsing fails
        }
        
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        
        return `${displayHour}:${minutes.padStart(2, '0')} ${period}`
      }
      
      // If it's just hours (e.g., "20"), convert it
      const hour = parseInt(time, 10)
      if (!isNaN(hour) && hour >= 0 && hour <= 23) {
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        
        return `${displayHour}:00 ${period}`
      }
      
      return time24 // Return original if no conversion possible
    } catch {
      return time24 // Return original if any error occurs
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {event.eventName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Header */}
          <div className="flex items-start gap-4">
            <Image
              src={event.image || "/images/BandFallBack.PNG"}
              alt={event.eventName}
              width={120}
              height={120}
              className="rounded-lg object-cover"
            />
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(event.eventDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formatTime12Hour(event.eventTime)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {event.selectedLocation?.name || "TBA"}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {event.eventGenre}
                </Badge>
              </div>
              
              <Badge 
                variant={event.status === 'live' ? 'default' : event.status === 'posted' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {event.status}
              </Badge>
            </div>
          </div>

          {/* Event Stats */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4">Event Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{event.ticketsSold}</div>
                <div className="text-sm text-muted-foreground">Tickets Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{event.ticketCapacity}</div>
                <div className="text-sm text-muted-foreground">Total Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">${event.guarantee}</div>
                <div className="text-sm text-muted-foreground">Guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">${event.ticketsSold * event.ticketPrice}</div>
                <div className="text-sm text-muted-foreground">Current Earnings</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Ticket Sales Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Band Lineup */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Band Lineup</h3>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {event.bands.length}/{event.numberOfBands} Bands
                </span>
                {event.bands.length < event.numberOfBands && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {event.numberOfBands - event.bands.length} more needed
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {/* Confirmed Bands */}
              {event.bands.map((band, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{band.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {band.genre} • {formatTime12Hour(band.setTime)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {band.percentage}%
                    </span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              ))}
              
              {/* Placeholder slots for bands still needed */}
              {Array.from({ length: event.numberOfBands - event.bands.length }, (_, index) => (
                <div key={`placeholder-${index}`} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-orange-700">Band Slot Available</div>
                    <div className="text-sm text-orange-600">
                      Genre TBD • Time TBD
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-orange-700">
                      TBD%
                    </span>
                    <div className="w-4 h-4 border-2 border-orange-300 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {event.bands.length === 0 && event.numberOfBands === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>No bands confirmed yet</p>
              </div>
            )}
          </Card>

          {/* Requirements */}
          {event.requirements && event.requirements.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-4">Event Requirements</h3>
              <div className="space-y-2">
                {event.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle 
                      className={`w-4 h-4 ${req.checked ? 'text-green-500' : 'text-gray-400'}`} 
                    />
                    <span className={`text-sm ${req.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Additional Details */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Ticket Price:</span>
                <div className="font-medium text-foreground">${event.ticketPrice}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Promoter:</span>
                <div className="font-medium text-foreground">
                  {event.selectedPromoter ? `${event.selectedPromoter.firstName} ${event.selectedPromoter.lastName}` : 'Not assigned'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Door Person:</span>
                <div className="font-medium text-foreground">
                  {event.selectedDoorPerson ? `${event.selectedDoorPerson.firstName} ${event.selectedDoorPerson.lastName}` : 'Not assigned'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <div className="font-medium text-foreground">
                  {new Date(event.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="default" 
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
