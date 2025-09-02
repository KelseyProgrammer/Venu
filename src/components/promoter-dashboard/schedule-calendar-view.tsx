"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react"
interface ScheduleCalendarViewProps {
  scheduleFilter: string;
  unavailableDates: string[];
  onToggleDateAvailability: (dateString: string) => void;
}

export function ScheduleCalendarView({ 
  scheduleFilter, 
  unavailableDates, 
  onToggleDateAvailability 
}: ScheduleCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
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

  // Memoize calendar days calculation for better performance
  const calendarDays = useMemo(() => {
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return Array.from({ length: 35 }, (_, i) => {
      const day = i - 3; // Start from previous month to fill first week
      
      // Check if this date has an event (considering filter)
      const eventOnDate = filteredEvents.find(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === day && 
               eventDate.getMonth() === currentMonth && 
               eventDate.getFullYear() === currentYear;
      });
      
      // Check if date is unavailable
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isUnavailable = unavailableDates.includes(dateString);
      
      // Check if date is in the past
      const isPast = day < 1 || (day < today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear());
      
      // Check if date is today
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      
      // Check if date is in current month
      const isCurrentMonth = day >= 1 && day <= new Date(currentYear, currentMonth + 1, 0).getDate();
      
      // Determine if event needs more bands
      const needsMoreBands = eventOnDate && eventOnDate.expectedBands > eventOnDate.confirmedBands;
      
      return {
        day,
        eventOnDate,
        isUnavailable,
        isPast,
        isToday,
        isCurrentMonth,
        needsMoreBands,
        dateString
      };
    });
  }, [currentDate, filteredEvents, unavailableDates])

  // Calendar navigation functions
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }, [])

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground">Calendar View</h3>
        <div className="text-sm text-muted-foreground">
          {scheduleFilter === "unavailable" 
            ? `Showing ${unavailableDates.length} unavailable dates`
            : scheduleFilter === "available"
            ? `Showing available dates`
            : scheduleFilter === "all"
            ? `Showing all dates (available and unavailable)`
            : `Showing ${filteredEvents.length} of ${myEvents.length} events`
          }
        </div>
      </div>

      {/* Calendar-specific filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={scheduleFilter === "all" ? "default" : "outline"} 
          size="sm"
          className={`whitespace-nowrap ${scheduleFilter === "all" ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-purple-200 text-purple-700 hover:bg-purple-50"}`}
        >
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
          All Dates
        </Button>
        <Button 
          variant={scheduleFilter === "unavailable" ? "default" : "outline"} 
          size="sm"
          className={`whitespace-nowrap ${scheduleFilter === "unavailable" ? "bg-red-600 hover:bg-red-700 text-white" : "border-red-200 text-red-700 hover:bg-red-50"}`}
        >
          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
          Unavailable
        </Button>
        <Button 
          variant={scheduleFilter === "available" ? "default" : "outline"} 
          size="sm"
          className={`whitespace-nowrap ${scheduleFilter === "available" ? "bg-gray-600 hover:bg-gray-700 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
        >
          <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
          Available
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="p-6 bg-card border-border">
        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button 
            variant="default" 
            size="lg" 
            onClick={goToPreviousMonth} 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 min-w-[60px] min-h-[48px] touch-manipulation"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <Button 
            variant="default" 
            size="lg" 
            onClick={goToToday}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-base font-medium min-h-[48px] touch-manipulation"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Today
          </Button>
          <Button 
            variant="default" 
            size="lg" 
            onClick={goToNextMonth} 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 min-w-[60px] min-h-[48px] touch-manipulation"
          >
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
        
        {/* Month/Year Header */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-foreground">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click on available dates to mark them as unavailable
          </p>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Generate calendar days for current month */}
          {calendarDays.map((dayData, i) => {
            const { day, eventOnDate, isUnavailable, isPast, isToday, isCurrentMonth, needsMoreBands, dateString } = dayData;
            
            // For unavailable filter, only show unavailable days
            if (scheduleFilter === "unavailable" && !isUnavailable) {
              return <div key={i} className="h-20 bg-muted/20 rounded-lg"></div>;
            }
            
            // For available filter, only show available days (no events, not unavailable, not past)
            if (scheduleFilter === "available" && (eventOnDate || isUnavailable || isPast)) {
              return <div key={i} className="h-20 bg-muted/20 rounded-lg"></div>;
            }
            
            if (!isCurrentMonth) {
              return <div key={i} className="h-20 bg-muted/20 rounded-lg"></div>;
            }
            
            return (
              <div 
                key={i} 
                onClick={() => {
                  // Only allow toggling availability for future dates that don't have events
                  if (!isPast && !eventOnDate) {
                    onToggleDateAvailability(dateString)
                  }
                }}
                className={`h-20 p-2 rounded-lg border transition-all duration-200 ${
                  !isPast && !eventOnDate 
                    ? 'cursor-pointer hover:shadow-md' 
                    : 'cursor-default'
                } ${
                  isToday 
                    ? 'bg-purple-600 border-purple-600 shadow-md' 
                    : isUnavailable
                    ? scheduleFilter === "unavailable"
                      ? 'bg-red-50 border-red-300 shadow-md' 
                      : 'bg-white border-red-200'
                    : eventOnDate && needsMoreBands
                    ? 'bg-white border-yellow-200'
                    : eventOnDate
                    ? 'bg-white border-green-200' 
                    : isPast 
                    ? 'bg-white border-muted' 
                    : 'bg-white border-border hover:border-primary/50'
                }`}
              >
                <div className={`text-sm font-medium mb-1 relative z-10 ${
                  isToday 
                    ? 'text-white' 
                    : isUnavailable
                    ? scheduleFilter === "unavailable"
                      ? 'text-red-700 font-bold'
                      : 'text-red-600'
                    : eventOnDate && needsMoreBands
                    ? 'text-yellow-600'
                    : eventOnDate 
                    ? 'text-green-600' 
                    : isPast 
                    ? 'text-muted-foreground' 
                    : 'text-gray-900 font-semibold'
                }`}>
                  {day}
                </div>
                
                {eventOnDate && (
                  <div className="space-y-1 max-h-12 overflow-hidden">
                    {filteredEvents
                      .filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate.getDate() === day && 
                               eventDate.getMonth() === currentDate.getMonth() && 
                               eventDate.getFullYear() === currentDate.getFullYear();
                      })
                      .slice(0, 2) // Limit to 2 events max
                      .map((event) => (
                        <div 
                          key={event.id} 
                          className={`text-xs p-1 rounded truncate ${
                            needsMoreBands
                              ? 'bg-yellow-200 text-yellow-800' 
                              : 'bg-green-200 text-green-800'
                          }`}
                        >
                          <div className="font-medium truncate" title={event.artist}>
                            {event.artist}
                          </div>
                          {needsMoreBands && (
                            <div className="text-xs font-bold mt-0.5 truncate">
                              Need {event.expectedBands - event.confirmedBands} more
                            </div>
                          )}
                        </div>
                      ))}
                    {filteredEvents.filter(event => {
                      const eventDate = new Date(event.date);
                      return eventDate.getDate() === day && 
                             eventDate.getMonth() === currentDate.getMonth() && 
                             eventDate.getFullYear() === currentDate.getFullYear();
                    }).length > 2 && (
                      <div className="text-xs text-muted-foreground font-medium">
                        +{filteredEvents.filter(event => {
                          const eventDate = new Date(event.date);
                          return eventDate.getDate() === day && 
                                 eventDate.getMonth() === currentDate.getMonth() && 
                                 eventDate.getFullYear() === currentDate.getFullYear();
                        }).length - 2} more
                      </div>
                    )}
                  </div>
                )}
                
                {!eventOnDate && !isPast && !isUnavailable && (
                  <div className={`text-xs mt-1 font-medium ${
                    isToday ? 'text-white' : 'text-gray-600'
                  }`}>
                    Available
                  </div>
                )}
                
                {!eventOnDate && !isPast && isUnavailable && (
                  <div className={`text-xs mt-2 font-medium ${
                    isToday 
                      ? 'text-white'
                      : scheduleFilter === "unavailable"
                      ? 'text-red-700 font-bold'
                      : 'text-red-600'
                  }`}>
                    Unavailable
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4 bg-card border-border">
        <div className="mb-3">
          <h4 className="text-sm font-medium text-foreground mb-2">Calendar Legend</h4>
          <p className="text-xs text-muted-foreground">
            Click on available dates (white with gray border) to toggle availability
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-300 rounded"></div>
            <span className="text-purple-600 font-medium">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span className="text-green-600 font-medium">Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 rounded"></div>
            <span className="text-yellow-600 font-medium">Bands Still Needed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 rounded"></div>
            <span className="text-red-600 font-medium">Date Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-muted-foreground">Past</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span className="text-black font-medium">Available (Clickable)</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
