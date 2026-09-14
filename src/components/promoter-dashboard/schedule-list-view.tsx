"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Music } from "lucide-react"
import { dateUtils, timeUtils } from "@/lib/utils"
import { GigProfile } from "@/lib/api"
import { EventDetailsModal } from "@/components/location-dashboard/event-details-modal"
import { ManageEventModal } from "@/components/location-dashboard/manage-event-modal"

interface ScheduleListViewProps {
  scheduleFilter: string;
  gigs: GigProfile[];
  onRefreshGigs: () => void;
}

export function ScheduleListView({ scheduleFilter, gigs, onRefreshGigs }: ScheduleListViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<GigProfile | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)

  const myEvents = useMemo(() =>
    gigs.map(gig => ({
      id: gig._id,
      gig,
      name: gig.eventName,
      date: new Date(gig.eventDate).toISOString().split('T')[0],
      location: typeof gig.selectedLocation === "object" ? gig.selectedLocation?.name || "TBA" : "TBA",
      status: gig.status,
      time: timeUtils.formatTime12Hour(gig.eventTime),
      genre: gig.eventGenre,
      artist: gig.bands.length > 0 ? gig.bands[0].name : "TBA",
      expectedBands: gig.numberOfBands,
      confirmedBands: gig.bands.filter(band => band.confirmed).length,
      ticketsSold: gig.ticketsSold ?? 0,
      totalTickets: gig.ticketCapacity,
      guarantee: gig.guarantee,
      currentEarnings: (gig.ticketsSold ?? 0) * (gig.ticketPrice ?? 0),
      applications: gig.bands.filter(band => !band.confirmed).length,
    })), [gigs])

  // Filter events based on selected filter
  const filteredEvents = useMemo(() => {
    if (scheduleFilter === "all") return myEvents;

    return myEvents.filter(event => {
      const eventDate = dateUtils.parseEventDate(event.date);
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
        case "available":
          // Availability filters affect the calendar highlighting, not the event list
          return true;
        default:
          return true;
      }
    });
  }, [myEvents, scheduleFilter])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground">My Events</h3>
        <div className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} of {myEvents.length} events
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
        </div>
      </Card>

      {filteredEvents.length === 0 && (
        <Card className="p-6 bg-card border-border text-center">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-foreground font-medium">No events yet</p>
          <p className="text-sm text-muted-foreground">
            Post a gig or get assigned to a venue and your events will show up here.
          </p>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className={`p-4 bg-card ${
            event.expectedBands > event.confirmedBands
              ? 'border-yellow-200 border-2'
              : 'border-green-200 border-2'
          }`}>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <Music className="w-8 h-8 text-purple-400" />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{event.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {dateUtils.formatEventDate(event.date, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })} • {event.time} • {event.location}
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
                  {event.expectedBands > event.confirmedBands ? (
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
                    onClick={() => { setSelectedEvent(event.gig); setIsDetailsModalOpen(true) }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-24 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => { setSelectedEvent(event.gig); setIsManageModalOpen(true) }}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
      <ManageEventModal
        event={selectedEvent}
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onRefresh={onRefreshGigs}
      />
    </div>
  )
}
