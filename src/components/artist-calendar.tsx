"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CalendarDays, 
  Clock, 
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { format, isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { cn } from "@/lib/utils"

interface ArtistCalendarProps {
  unavailableDates?: Date[]
  preferredBookingDays?: string[]
  bookingLeadTime?: string
  onUnavailableDatesChange?: (dates: Date[]) => void
  onPreferredDaysChange?: (days: string[]) => void
  onBookingLeadTimeChange?: (time: string) => void
  className?: string
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const BOOKING_LEAD_TIME_OPTIONS = [
  'Same day', '1-3 days', '1 week', '2 weeks', '1 month', '3+ months'
]

export function ArtistCalendar({
  unavailableDates = [],
  preferredBookingDays = [],
  bookingLeadTime = '',
  onUnavailableDatesChange,
  onPreferredDaysChange,
  onBookingLeadTimeChange,
  className
}: ArtistCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get all dates in current month for availability display
  const monthDates = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  // Handle unavailable date toggle
  const toggleUnavailableDate = useCallback((date: Date) => {
    const isUnavailable = unavailableDates.some(d => isSameDay(d, date))
    const newDates = isUnavailable
      ? unavailableDates.filter(d => !isSameDay(d, date))
      : [...unavailableDates, date]
    
    onUnavailableDatesChange?.(newDates)
  }, [unavailableDates, onUnavailableDatesChange])

  // Handle preferred day toggle
  const togglePreferredDay = useCallback((day: string) => {
    const newDays = preferredBookingDays.includes(day)
      ? preferredBookingDays.filter(d => d !== day)
      : [...preferredBookingDays, day]
    
    onPreferredDaysChange?.(newDays)
  }, [preferredBookingDays, onPreferredDaysChange])

  // Get day of week name
  const getDayName = useCallback((date: Date) => {
    return DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1]
  }, [])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Availability Calendar</h3>
          <p className="text-sm text-muted-foreground">
            Manage your unavailable dates and preferred booking days
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(prev => addDays(prev, -30))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(prev => addDays(prev, 30))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day.slice(0, 3)}
              </div>
            ))}
            
            {/* Calendar dates */}
            {monthDates.map((date, index) => {
              const isUnavailable = unavailableDates.some(d => isSameDay(d, date))
              const isPreferred = preferredBookingDays.includes(getDayName(date))
              const isToday = isSameDay(date, new Date())
              const isPast = date < new Date()
              
              return (
                <div
                  key={index}
                  className={cn(
                    "h-12 p-1 text-center text-sm cursor-pointer border rounded transition-colors",
                    isToday && "bg-purple-100 border-purple-300 font-bold",
                    isUnavailable && "bg-red-100 border-red-300 text-red-700",
                    isPreferred && !isUnavailable && "bg-green-100 border-green-300",
                    isPast && "bg-gray-100 text-gray-400 cursor-not-allowed",
                    !isPast && "hover:bg-gray-50"
                  )}
                  onClick={() => !isPast && toggleUnavailableDate(date)}
                  title={`${format(date, 'MMM dd, yyyy')} - ${getDayName(date)}`}
                >
                  <div className="flex items-center justify-center h-full">
                    <span>{date.getDate()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Calendar Legend</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Preferred Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Past Date</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferred Days Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Preferred Booking Days
          </CardTitle>
          <CardDescription>
            Select the days you prefer to perform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Badge
                key={day}
                variant={preferredBookingDays.includes(day) ? "default" : "outline"}
                className={`cursor-pointer ${
                  preferredBookingDays.includes(day)
                    ? "bg-purple-600 hover:bg-purple-700 text-white" 
                    : "hover:bg-purple-50"
                }`}
                onClick={() => togglePreferredDay(day)}
              >
                {day}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Lead Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Booking Lead Time
          </CardTitle>
          <CardDescription>
            How much notice do you typically need for bookings?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {BOOKING_LEAD_TIME_OPTIONS.map((time) => (
              <Button
                key={time}
                variant={bookingLeadTime === time ? "default" : "outline"}
                size="sm"
                className={bookingLeadTime === time ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                onClick={() => onBookingLeadTimeChange?.(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Availability Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{preferredBookingDays.length} preferred booking days</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{unavailableDates.length} unavailable dates</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Booking lead time: {bookingLeadTime || 'Not set'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
