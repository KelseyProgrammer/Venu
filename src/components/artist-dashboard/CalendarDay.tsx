"use client"

import { memo, useCallback } from "react"
import { getLocationDisplayName } from "@/lib/location-data"
import type { Booking } from "./types"

interface CalendarDayProps {
  day: number
  currentMonth: number
  currentYear: number
  today: Date
  bookingOnDate?: Booking | undefined
  availableDates: string[]
  unavailableDates: string[]
  availabilityFilter: string
  onToggleAvailability: (dateString: string) => void
  shouldShowDate?: boolean
}

export const CalendarDay = memo(function CalendarDay({
  day,
  currentMonth,
  currentYear,
  today,
  bookingOnDate,
  availableDates,
  unavailableDates,
  availabilityFilter,
  onToggleAvailability,
  shouldShowDate = true,
}: CalendarDayProps) {
  const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  const isAvailable = availableDates.includes(dateString)
  const isUnavailable = unavailableDates.includes(dateString)
  const isPast =
    day < 1 ||
    (day < today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear())
  const isToday =
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear()
  const isCurrentMonth = day >= 1 && day <= new Date(currentYear, currentMonth + 1, 0).getDate()

  const handleClick = useCallback(() => {
    if (!isPast && !bookingOnDate) {
      onToggleAvailability(dateString)
    }
  }, [isPast, bookingOnDate, dateString, onToggleAvailability])

  if (!isCurrentMonth) {
    return <div className="h-20 bg-muted/20 rounded-lg" />
  }

  if (!shouldShowDate) {
    return <div className="h-20 bg-black/20 rounded-lg opacity-50" />
  }

  if (availabilityFilter === "unavailable" && !isUnavailable) {
    return <div className="h-20 bg-muted/20 rounded-lg" />
  }

  if (availabilityFilter === "available" && !isAvailable) {
    return <div className="h-20 bg-muted/20 rounded-lg" />
  }

  return (
    <div
      onClick={handleClick}
      className={`h-20 p-2 rounded-lg border transition-all duration-200 ${
        !isPast && !bookingOnDate ? "cursor-pointer hover:shadow-md" : "cursor-default"
      } ${
        isToday
          ? "bg-purple-600 border-purple-600 shadow-md"
          : isUnavailable
          ? availabilityFilter === "unavailable"
            ? "bg-red-50 border-red-300 shadow-md"
            : "bg-white border-red-200"
          : isAvailable
          ? availabilityFilter === "available"
            ? "bg-green-50 border-green-300 shadow-md"
            : "bg-white border-green-200"
          : bookingOnDate?.status === "confirmed"
          ? "bg-white border-green-200"
          : bookingOnDate?.status === "completed"
          ? "bg-white border-gray-300"
          : bookingOnDate?.status === "awaiting-confirmation"
          ? "bg-white border-orange-200"
          : bookingOnDate?.status === "pending"
          ? "bg-white border-yellow-200"
          : isPast
          ? "bg-white border-muted"
          : "bg-white border-border hover:border-primary/50"
      }`}
    >
      <div
        className={`text-sm font-medium mb-1 relative z-10 ${
          isToday
            ? "text-white"
            : isUnavailable
            ? availabilityFilter === "unavailable"
              ? "text-red-700 font-bold"
              : "text-red-600"
            : isAvailable
            ? availabilityFilter === "available"
              ? "text-green-700 font-bold"
              : "text-green-600"
            : bookingOnDate?.status === "confirmed"
            ? "text-green-600"
            : bookingOnDate?.status === "completed"
            ? "text-gray-600"
            : bookingOnDate?.status === "awaiting-confirmation"
            ? "text-orange-600"
            : bookingOnDate?.status === "pending"
            ? "text-yellow-600"
            : isPast
            ? "text-muted-foreground"
            : "text-gray-900 font-semibold"
        }`}
      >
        {day}
      </div>

      {bookingOnDate && (
        <div className="space-y-1 max-h-12 overflow-hidden">
          <div
            className={`text-xs p-1 rounded truncate ${
              bookingOnDate.status === "confirmed"
                ? "bg-green-200 text-green-800"
                : bookingOnDate.status === "completed"
                ? "bg-gray-200 text-gray-800"
                : bookingOnDate.status === "awaiting-confirmation"
                ? "bg-orange-200 text-orange-800"
                : "bg-yellow-200 text-yellow-800"
            }`}
          >
            <div
              className="font-medium truncate"
              title={getLocationDisplayName(bookingOnDate.location)}
            >
              {getLocationDisplayName(bookingOnDate.location)}
            </div>
            <div className="text-xs font-bold mt-0.5 truncate">
              {bookingOnDate.status === "confirmed"
                ? `Complete (${bookingOnDate.confirmedBands}/${bookingOnDate.expectedBands})`
                : bookingOnDate.status === "completed"
                ? `Past (${bookingOnDate.confirmedBands}/${bookingOnDate.expectedBands})`
                : bookingOnDate.status === "awaiting-confirmation"
                ? "Confirm Required"
                : `Need ${(bookingOnDate.expectedBands || 0) - (bookingOnDate.confirmedBands || 0)} more`}
            </div>
          </div>
        </div>
      )}

      {!bookingOnDate && !isPast && isAvailable && (
        <div className={`text-xs mt-1 font-medium ${isToday ? "text-white" : "text-black"}`}>
          Available
        </div>
      )}

      {!bookingOnDate && !isPast && isUnavailable && (
        <div
          className={`text-xs mt-2 font-medium ${
            isToday
              ? "text-white"
              : availabilityFilter === "unavailable"
              ? "text-red-700 font-bold"
              : "text-red-600"
          }`}
        >
          Unavailable
        </div>
      )}
    </div>
  )
})
