"use client"

import { memo, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, Music, CheckCircle } from "lucide-react"
import Image from "next/image"
import { getLocationDisplayName } from "@/lib/location-data"
import type { Booking } from "./types"

interface ArtistEventDetailsModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
}

export const ArtistEventDetailsModal = memo(function ArtistEventDetailsModal({
  booking,
  isOpen,
  onClose,
}: ArtistEventDetailsModalProps) {
  const formatTime12Hour = useCallback((time24: string): string => {
    try {
      const time = time24.trim()
      if (time.includes("AM") || time.includes("PM")) return time
      if (time.includes(":")) {
        const [hours, minutes] = time.split(":")
        const hour = parseInt(hours, 10)
        const minute = parseInt(minutes, 10)
        if (isNaN(hour) || isNaN(minute)) return time24
        const period = hour >= 12 ? "PM" : "AM"
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        return `${displayHour}:${minutes.padStart(2, "0")} ${period}`
      }
      const hour = parseInt(time, 10)
      if (!isNaN(hour) && hour >= 0 && hour <= 23) {
        const period = hour >= 12 ? "PM" : "AM"
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        return `${displayHour}:00 ${period}`
      }
      return time24
    } catch {
      return time24
    }
  }, [])

  const progress = useMemo(() => {
    if (!booking) return 0
    return (booking.ticketsSold / booking.totalTickets) * 100
  }, [booking])

  if (!booking) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {booking.eventName || getLocationDisplayName(booking.location)}
          </DialogTitle>
          <DialogDescription>Event details and booking information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Header */}
          <div className="flex items-start gap-4">
            <Image
              src={booking.image || "/images/BandFallBack.PNG"}
              alt={booking.eventName || "Event"}
              width={120}
              height={120}
              className="rounded-lg object-cover"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(booking.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formatTime12Hour(booking.time)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {getLocationDisplayName(booking.location)}
                </span>
              </div>
              {booking.genre && (
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    {booking.genre}
                  </Badge>
                </div>
              )}
              <Badge
                variant={
                  booking.status === "confirmed"
                    ? "default"
                    : booking.status === "pending" || booking.status === "awaiting-confirmation"
                    ? "secondary"
                    : "outline"
                }
                className={`text-xs ${
                  booking.status === "confirmed"
                    ? "bg-green-600"
                    : booking.status === "pending"
                    ? "bg-yellow-600"
                    : booking.status === "awaiting-confirmation"
                    ? "bg-orange-600"
                    : booking.isPast
                    ? "bg-blue-600"
                    : "bg-gray-600"
                }`}
              >
                {booking.status === "confirmed"
                  ? "Confirmed"
                  : booking.status === "pending"
                  ? "Needs Band"
                  : booking.status === "awaiting-confirmation"
                  ? "Awaiting Confirmation"
                  : booking.status === "completed"
                  ? "Past Show"
                  : booking.isPast
                  ? "Past Show"
                  : booking.status}
              </Badge>
            </div>
          </div>

          {/* Event Stats */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4">Event Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{booking.ticketsSold}</div>
                <div className="text-sm text-muted-foreground">Tickets Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{booking.totalTickets}</div>
                <div className="text-sm text-muted-foreground">Total Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">${booking.artistGuarantee || 0}</div>
                <div className="text-sm text-muted-foreground">Your Guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">${booking.earnings}</div>
                <div className="text-sm text-muted-foreground">Your Earnings</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Ticket Sales Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Performance Details */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4">Your Performance Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Your Set</div>
                  <div className="text-sm text-muted-foreground">
                    {booking.genre || "TBD"} •{" "}
                    {booking.artistSetTime ? formatTime12Hour(booking.artistSetTime) : "TBD"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {booking.artistPercentage || 0}%
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Details */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Your Percentage:</span>
                <div className="font-medium text-foreground">{booking.artistPercentage || 0}% of revenue</div>
              </div>
              <div>
                <span className="text-muted-foreground">Your Guarantee:</span>
                <div className="font-medium text-foreground">${booking.artistGuarantee || 0}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Current Earnings:</span>
                <div className="font-medium text-green-400">${booking.earnings}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="font-medium text-foreground">
                  {booking.status === "confirmed"
                    ? "Confirmed"
                    : booking.status === "pending"
                    ? "Needs Band"
                    : booking.status === "completed"
                    ? "Past Show"
                    : booking.isPast
                    ? "Past Show"
                    : booking.status}
                </div>
              </div>
            </div>
          </Card>

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
})
