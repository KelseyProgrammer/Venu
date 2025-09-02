"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import Image from "next/image"
interface ScheduleListViewProps {
  scheduleFilter: string;
}

export function ScheduleListView({ scheduleFilter }: ScheduleListViewProps) {
  const myEvents = useMemo(() => [
    {
      id: 1,
      name: "Rock Night",
      date: "2024-12-15",
      location: "Muggsy's",
      status: "confirmed",
      time: "8:00 PM",
      genre: "Rock",
      image: "/images/BandFallBack.PNG"
    },
    {
      id: 2,
      name: "Jazz Evening",
      date: "2024-12-20",
      location: "Sarbez",
      status: "pending",
      time: "9:00 PM",
      genre: "Jazz",
      image: "/images/BandFallBack.PNG"
    }
  ], [])

  // Filter events based on selected filter
  const filteredEvents = useMemo(() => {
    if (scheduleFilter === "all") return myEvents;
    
    return myEvents.filter(event => {
      switch (scheduleFilter) {
        case "complete":
          return event.expectedBands <= event.confirmedBands;
        case "needs-bands":
          return event.expectedBands > event.confirmedBands;
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

      <div className="grid gap-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className={`p-4 bg-card ${
            event.expectedBands > event.confirmedBands 
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
                      })} • {event.time}
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
                  <Button variant="default" size="sm" className="w-28 bg-purple-600 hover:bg-purple-700 text-white">
                    View Details
                  </Button>
                  <Button variant="default" size="sm" className="w-24 bg-purple-600 hover:bg-purple-700 text-white">
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
