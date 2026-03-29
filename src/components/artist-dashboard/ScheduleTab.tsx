"use client"

import { memo, useState, useMemo, useCallback, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowLeft, ArrowRight, BarChart3 } from "lucide-react"
import Image from "next/image"
import { getLocationDisplayName } from "@/lib/location-data"
import { CalendarDay } from "./CalendarDay"
import type { Booking } from "./types"

interface ScheduleTabProps {
  myBookings: Booking[]
  availableDates: string[]
  unavailableDates: string[]
  onToggleAvailability: (dateString: string) => void
  gigsLoading: boolean
  bookingRequests: number
  gigConfirmations: number
  onViewDetails: (booking: Booking) => void
}

export const ScheduleTab = memo(function ScheduleTab({
  myBookings,
  availableDates,
  unavailableDates,
  onToggleAvailability,
  gigsLoading,
  bookingRequests,
  gigConfirmations,
  onViewDetails,
}: ScheduleTabProps) {
  const [scheduleSubcategory, setScheduleSubcategory] = useState("list")
  const [scheduleFilter, setScheduleFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [, startTransition] = useTransition()

  const filteredBookings = useMemo(() => {
    if (scheduleFilter === "all") return myBookings
    return myBookings.filter((booking) => {
      switch (scheduleFilter) {
        case "confirmed":
          return booking.status === "confirmed"
        case "needs-band":
          return booking.status === "pending" || booking.status === "awaiting-confirmation"
        case "past":
          return booking.status === "completed" || booking.isPast === true
        default:
          return true
      }
    })
  }, [myBookings, scheduleFilter])

  const calendarData = useMemo(() => {
    const todayDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    const bookingMap = new Map<string, Booking>()
    filteredBookings.forEach((booking) => {
      const bookingDate = new Date(booking.date)
      const key = `${bookingDate.getDate()}-${bookingDate.getMonth()}-${bookingDate.getFullYear()}`
      bookingMap.set(key, booking)
    })
    return {
      todayDate,
      currentMonth,
      currentYear,
      bookingMap,
      daysInMonth: new Date(currentYear, currentMonth + 1, 0).getDate(),
    }
  }, [currentDate, filteredBookings])

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(
      calendarData.currentYear,
      calendarData.currentMonth,
      1
    ).getDay()
    return Array.from({ length: 35 }, (_, i) => {
      const day = i - firstDayOfMonth + 1
      const key = `${day}-${calendarData.currentMonth}-${calendarData.currentYear}`
      const bookingOnDate = calendarData.bookingMap.get(key)
      let shouldShowDate = true
      if (scheduleFilter !== "all") {
        if (scheduleFilter === "confirmed") shouldShowDate = bookingOnDate?.status === "confirmed"
        else if (scheduleFilter === "needs-band")
          shouldShowDate =
            bookingOnDate?.status === "pending" ||
            bookingOnDate?.status === "awaiting-confirmation"
        else if (scheduleFilter === "past") shouldShowDate = bookingOnDate?.status === "completed"
      }
      return { day, bookingOnDate: shouldShowDate ? bookingOnDate : undefined, shouldShowDate }
    })
  }, [calendarData, scheduleFilter])

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() - 1)
      return d
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + 1)
      return d
    })
  }, [])

  const goToToday = useCallback(() => setCurrentDate(new Date()), [])

  const handleSetScheduleFilter = useCallback(
    (filter: string) => startTransition(() => setScheduleFilter(filter)),
    []
  )

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">My Schedule</h2>
        <div className="flex items-center gap-2">
          {bookingRequests > 0 && (
            <Badge variant="default" className="bg-green-600 text-white">
              {bookingRequests} new booking{bookingRequests !== 1 ? "s" : ""}
            </Badge>
          )}
          {gigConfirmations > 0 && (
            <Badge variant="default" className="bg-orange-600 text-white">
              {gigConfirmations} confirmation{gigConfirmations !== 1 ? "s" : ""} needed
            </Badge>
          )}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={scheduleSubcategory === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setScheduleSubcategory("list")}
          className={`whitespace-nowrap ${scheduleSubcategory === "list" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <BarChart3 className="w-4 h-4 mr-1" />
          List View
        </Button>
        <Button
          variant={scheduleSubcategory === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setScheduleSubcategory("calendar")}
          className={`whitespace-nowrap ${scheduleSubcategory === "calendar" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <Calendar className="w-4 h-4 mr-1" />
          Calendar View
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: "all", label: "All Shows", color: "purple" },
          { value: "confirmed", label: "Confirmed Shows", color: "green" },
          { value: "needs-band", label: "Needs Band", color: "yellow" },
          { value: "past", label: "Past", color: "blue" },
        ].map(({ value, label, color }) => (
          <Button
            key={value}
            variant={scheduleFilter === value ? "default" : "outline"}
            size="sm"
            onClick={() => handleSetScheduleFilter(value)}
            className={`whitespace-nowrap ${
              scheduleFilter === value
                ? `bg-${color}-600 hover:bg-${color}-700 text-white`
                : `border-${color}-200 text-${color}-700 hover:bg-${color}-50`
            }`}
          >
            <div className={`w-2 h-2 bg-${color}-500 rounded-full mr-1`} />
            {label}
          </Button>
        ))}
      </div>

      {/* Availability filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: "all", label: "All Dates", color: "purple" },
          { value: "unavailable", label: "Unavailable", color: "red" },
          { value: "available", label: "Available", color: "gray" },
        ].map(({ value, label, color }) => (
          <Button
            key={value}
            variant={availabilityFilter === value ? "default" : "outline"}
            size="sm"
            onClick={() => setAvailabilityFilter(value)}
            className={`whitespace-nowrap ${
              availabilityFilter === value
                ? `bg-${color}-600 hover:bg-${color}-700 text-white`
                : `border-${color}-200 text-${color}-700 hover:bg-${color}-50`
            }`}
          >
            <div className={`w-2 h-2 bg-${color}-500 rounded-full mr-1`} />
            {label}
          </Button>
        ))}
      </div>

      {/* List View */}
      {scheduleSubcategory === "list" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-foreground">My Shows</h3>
            <div className="text-sm text-muted-foreground">
              {gigsLoading
                ? "Loading..."
                : `Showing ${filteredBookings.length} of ${myBookings.length} shows`}
            </div>
          </div>

          {gigsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading your shows...</div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                No shows found. When locations post gigs with your email, they&apos;ll appear here.
              </div>
            </div>
          ) : (
            <>
              {/* Legend */}
              <Card className="p-4 bg-card border-border">
                <h4 className="font-medium text-foreground mb-3">Show Status Legend</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {[
                    { color: "green", label: "Confirmed Shows" },
                    { color: "yellow", label: "Needs Band" },
                    { color: "orange", label: "Awaiting Confirmation" },
                    { color: "blue", label: "Past Shows" },
                  ].map(({ color, label }) => (
                    <div key={color} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 bg-${color}-100 border border-${color}-200 rounded-full flex items-center justify-center`}
                      >
                        <div className={`w-2 h-2 bg-${color}-500 rounded-full`} />
                      </div>
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Booking cards */}
              <div className="grid gap-4">
                {filteredBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className={`p-4 bg-card ${
                      booking.status === "confirmed"
                        ? "border-green-200 border-2"
                        : booking.status === "pending"
                        ? "border-yellow-200 border-2"
                        : booking.status === "awaiting-confirmation"
                        ? "border-orange-200 border-2"
                        : booking.isPast
                        ? "border-blue-200 border-2"
                        : "border-gray-200 border-2"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Image
                        src={booking.image || "/images/venu-logo.png"}
                        alt={booking.eventName || "Show"}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {booking.eventName || getLocationDisplayName(booking.location)}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(booking.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              • {booking.time}
                              {booking.artistSetTime && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  Set: {booking.artistSetTime}
                                </span>
                              )}
                            </div>
                            {booking.genre && (
                              <div className="text-sm text-muted-foreground">
                                Genre: {booking.genre}
                              </div>
                            )}
                          </div>
                          <Badge
                            variant={booking.status === "confirmed" ? "default" : "secondary"}
                            className={
                              booking.status === "confirmed"
                                ? "bg-green-600"
                                : booking.status === "pending"
                                ? "bg-yellow-600"
                                : booking.isPast
                                ? "bg-blue-600"
                                : "bg-gray-600"
                            }
                          >
                            {booking.status === "confirmed"
                              ? "Confirmed"
                              : booking.status === "pending"
                              ? "Needs Band"
                              : booking.status === "completed"
                              ? "Past Show"
                              : booking.isPast
                              ? "Past Show"
                              : booking.status}
                          </Badge>
                        </div>

                        {/* Status pill */}
                        <div className="flex items-center gap-2 mb-3">
                          {booking.status === "confirmed" ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              Confirmed Show
                            </div>
                          ) : booking.status === "awaiting-confirmation" ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                              <div className="w-2 h-2 bg-orange-500 rounded-full" />
                              Awaiting Band Confirmation
                            </div>
                          ) : booking.status === "pending" ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                              Needs Band
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              Past Show
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Tickets Sold:</span>
                            <div className="font-medium text-foreground">
                              {booking.ticketsSold}/{booking.totalTickets}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Your Earnings:</span>
                            <div className="font-medium text-green-400">${booking.earnings}</div>
                            {booking.artistPercentage && (
                              <div className="text-xs text-muted-foreground">
                                {booking.artistPercentage}% of revenue
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="w-28 bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => onViewDetails(booking)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Calendar View */}
      {scheduleSubcategory === "calendar" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-foreground">Calendar View</h3>
            <div className="text-sm text-muted-foreground">
              {availabilityFilter === "unavailable"
                ? `Showing ${unavailableDates.length} unavailable dates`
                : availabilityFilter === "available"
                ? `Showing ${availableDates.length} available dates`
                : `Showing all dates (${availableDates.length} available, ${unavailableDates.length} unavailable)`}
            </div>
          </div>

          <Card className="p-6 bg-card border-border">
            {/* Navigation */}
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

            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-foreground">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Click on blank dates to cycle through: blank → available → unavailable → blank
              </p>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ day, bookingOnDate, shouldShowDate }, i) => (
                <CalendarDay
                  key={i}
                  day={day}
                  currentMonth={calendarData.currentMonth}
                  currentYear={calendarData.currentYear}
                  today={calendarData.todayDate}
                  bookingOnDate={bookingOnDate}
                  availableDates={availableDates}
                  unavailableDates={unavailableDates}
                  availabilityFilter={availabilityFilter}
                  onToggleAvailability={onToggleAvailability}
                  shouldShowDate={shouldShowDate}
                />
              ))}
            </div>
          </Card>

          {/* Legend */}
          <Card className="p-4 bg-card border-border">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-foreground mb-2">Calendar Legend</h4>
              <p className="text-xs text-muted-foreground">
                Click on blank dates to cycle through: blank → available → unavailable → blank
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                { bg: "bg-purple-300", text: "text-purple-600", label: "Today" },
                { bg: "bg-green-200", text: "text-green-600", label: "Confirmed" },
                { bg: "bg-orange-200", text: "text-orange-600", label: "Awaiting Confirmation" },
                { bg: "bg-yellow-200", text: "text-yellow-600", label: "Needs Band" },
                { bg: "bg-blue-200", text: "text-blue-600", label: "Completed" },
                { bg: "bg-green-100 border border-green-300", text: "text-green-600", label: "Available" },
                { bg: "bg-red-100 border border-red-300", text: "text-red-600", label: "Unavailable" },
                { bg: "bg-gray-200", text: "text-gray-600", label: "Blank (Clickable)" },
              ].map(({ bg, text, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 ${bg} rounded`} />
                  <span className={`${text} font-medium`}>{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
})
