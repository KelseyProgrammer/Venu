"use client"

import { useMemo, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import Image from "next/image"
import { useSocket, socketManager } from "@/lib/socket"
import { GigProfile, gigApi } from "@/lib/api"
import { EventDetailsModal } from "./event-details-modal"
import { ManageEventModal } from "./manage-event-modal"

interface ScheduleListViewProps {
  scheduleFilter: string;
  gigs: GigProfile[];
  locationId: string;
  onRefreshGigs: () => void;
}

export function ScheduleListView({ scheduleFilter, gigs, locationId, onRefreshGigs }: ScheduleListViewProps) {
  const socket = useSocket()
  const [selectedEvent, setSelectedEvent] = useState<GigProfile | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)

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

  // Listen for real-time schedule updates
  useEffect(() => {
    if (socket.connected && socketManager.getSocket()) {
      const handleScheduleUpdate = (data: { locationId: string }) => {
        if (data.locationId === locationId) {
          // Refresh gigs data when schedule is updated
          onRefreshGigs()
        }
      }

      socketManager.getSocket()!.on('schedule-update', handleScheduleUpdate)
      
      return () => {
        socketManager.getSocket()!.off('schedule-update', handleScheduleUpdate)
      }
    }
    return undefined
  }, [socket, locationId, onRefreshGigs])

  // Handle band confirmation
  const handleBandConfirmation = async (gigId: string, bandIndex: number) => {
    try {
      const gig = gigs.find(g => g._id === gigId)
      if (!gig) return

      // Update the band's confirmation status
      const updatedBands = gig.bands.map((band, index) => 
        index === bandIndex 
          ? { ...band, confirmed: true }
          : band
      )

      // Determine new status based on band count
      const confirmedBandsCount = updatedBands.filter(band => (band as { confirmed: boolean }).confirmed).length
      const newStatus = confirmedBandsCount >= gig.numberOfBands ? 'completed' : 
                       confirmedBandsCount > 0 ? 'posted' : 'posted'

      // Update the gig in the backend
      const response = await gigApi.updateGig(gigId, {
        bands: updatedBands,
        status: newStatus
      })

      if (response.success) {
        // Send real-time update
        if (socketManager.getSocket() && response.data) {
          socketManager.getSocket()!.emit('schedule-update', {
            locationId,
            gigId,
            action: 'band-confirmed',
            gigData: response.data as unknown as Record<string, unknown>
          })
        }
        
        // Refresh the gigs data
        onRefreshGigs()
      }
    } catch (error) {
      console.error('Error confirming band:', error)
    }
  }

  // Handle view details button click
  const handleViewDetails = (event: GigProfile) => {
    setSelectedEvent(event)
    setIsDetailsModalOpen(true)
  }

  // Handle manage button click
  const handleManage = (event: GigProfile) => {
    setSelectedEvent(event)
    setIsManageModalOpen(true)
  }

  // Transform gigs data to match the expected event format
  const myEvents = useMemo(() => {
    return gigs.map(gig => ({
      id: gig._id,
      name: gig.eventName,
      date: new Date(gig.eventDate).toISOString().split('T')[0],
      location: gig.selectedLocation?.name || "TBA",
      status: gig.status,
      time: gig.eventTime,
      genre: gig.eventGenre,
      image: gig.image || "/images/BandFallBack.PNG",
      artist: gig.bands.length > 0 ? gig.bands[0].name : "TBA",
      expectedBands: gig.numberOfBands,
      confirmedBands: gig.bands.length,
      ticketsSold: gig.ticketsSold,
      totalTickets: gig.ticketCapacity,
      guarantee: gig.guarantee,
      currentEarnings: gig.ticketsSold * gig.ticketPrice,
      applications: 0 // This would come from applications data
    }))
  }, [gigs])

  // Fallback to mock data if no gigs are available
  const fallbackEvents = useMemo(() => [
    {
      id: 1,
      name: "Rock Night",
      date: "2024-12-15",
      location: "Muggsy's",
      status: "confirmed",
      time: "8:00 PM",
      genre: "Rock",
      image: "/images/BandFallBack.PNG",
      artist: "Rock Night",
      expectedBands: 3,
      confirmedBands: 3,
      ticketsSold: 45,
      totalTickets: 100,
      guarantee: 500,
      currentEarnings: 750,
      applications: 8
    },
    {
      id: 2,
      name: "Jazz Evening",
      date: "2024-12-20",
      location: "Sarbez",
      status: "pending",
      time: "9:00 PM",
      genre: "Jazz",
      image: "/images/BandFallBack.PNG",
      artist: "Jazz Evening",
      expectedBands: 2,
      confirmedBands: 1,
      ticketsSold: 23,
      totalTickets: 80,
      guarantee: 300,
      currentEarnings: 345,
      applications: 5
    }
  ], [])

  // Use real gigs data if available, otherwise fallback to mock data
  const eventsToUse = myEvents.length > 0 ? myEvents : fallbackEvents

  // Filter events based on selected filter
  const filteredEvents = useMemo(() => {
    if (scheduleFilter === "all") return eventsToUse;
    
    return eventsToUse.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPast = eventDate < today;
      
      switch (scheduleFilter) {
        case "complete":
          return event.expectedBands <= event.confirmedBands;
        case "needs-bands":
          return event.expectedBands > event.confirmedBands;
        case "past":
          return isPast;
        case "unavailable":
          // For unavailable filter, we don't filter events - we show all events
          // The calendar will handle showing unavailable dates separately
          return true;
        case "available":
          // For available filter, we don't filter events - we show all events
          // The calendar will handle showing available dates separately
          return true;
        default:
          return true;
      }
    });
  }, [eventsToUse, scheduleFilter])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground">My Events</h3>
        <div className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} of {eventsToUse.length} events
        </div>
      </div>

      {/* Color Key Legend for List View */}
      <Card className="p-4 bg-card border-border">
        <h4 className="font-medium text-foreground mb-3">Event Status Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-muted-foreground">Lineup Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            </div>
            <span className="text-muted-foreground">Bands Still Needed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-muted-foreground">Past Shows</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredEvents.map((event) => {
          const eventDate = new Date(event.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isPast = eventDate < today;
          
          return (
            <Card key={event.id} className={`p-4 bg-card ${
              isPast
                ? 'border-blue-200 border-2'
                : event.expectedBands > event.confirmedBands 
                ? 'border-yellow-200 border-2' 
                : 'border-green-200 border-2'
            }`}>
            <div className="flex items-start gap-4">
              <Image
                src={event.image || "/images/BandFallBack.PNG"}
                alt={event.artist}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{event.artist}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })} • {formatTime12Hour(event.time)}
                      <Badge variant="outline" className="text-xs">
                        {event.genre}
                      </Badge>
                    </div>
                  </div>
                  <Badge 
                    variant={event.status === 'live' ? 'default' : event.status === 'posted' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {event.status}
                  </Badge>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 mb-3">
                  {isPast ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Past Show ({event.confirmedBands}/{event.expectedBands})
                    </div>
                  ) : event.expectedBands > event.confirmedBands ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Bands Still Needed ({event.confirmedBands}/{event.expectedBands})
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Lineup Complete ({event.confirmedBands}/{event.expectedBands})
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tickets:</span>
                    <div className="font-medium text-foreground">
                      {event.ticketsSold}/{event.totalTickets}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Guarantee:</span>
                    <div className="font-medium text-foreground">${event.guarantee}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Earnings:</span>
                    <div className="font-medium text-foreground">${event.currentEarnings}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applications:</span>
                    <div className="font-medium text-foreground">{event.applications}</div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-28 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      const gig = gigs.find(g => g._id === event.id)
                      if (gig) handleViewDetails(gig)
                    }}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-24 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      const gig = gigs.find(g => g._id === event.id)
                      if (gig) handleManage(gig)
                    }}
                  >
                    Manage
                  </Button>
                  {event.expectedBands > event.confirmedBands && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-32 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                      onClick={() => {
                        // Find the gig and confirm the first unconfirmed band
                        const gig = gigs.find(g => g._id === event.id)
                        if (gig) {
                          const unconfirmedBandIndex = gig.bands.findIndex(band => !(band as { confirmed?: boolean }).confirmed)
                          if (unconfirmedBandIndex !== -1) {
                            handleBandConfirmation(event.id.toString(), unconfirmedBandIndex)
                          }
                        }
                      }}
                    >
                      Confirm Band
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )})}
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedEvent(null)
        }}
      />

      {/* Manage Event Modal */}
      <ManageEventModal
        event={selectedEvent}
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false)
          setSelectedEvent(null)
        }}
        onRefresh={onRefreshGigs}
      />
    </div>
  )
}