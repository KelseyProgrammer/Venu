"use client"

import { RealTimeEventCard } from "./real-time-event-card"

interface Event {
  id: string
  artist: string
  location: string
  address: string
  date: string
  time: string
  genre: string
  ticketPrice: number
  ticketsRemaining: number
  totalTickets: number
  rating: number
  description: string
  image: string
  tags: string[]
  eventStatus?: string
  needsMoreBands?: boolean
  expectedBands?: number
  confirmedBands?: number
}

interface RealTimeEventsGridProps {
  events: Event[]
  favoriteEvents: Set<string>
  onToggleFavorite: (eventId: string) => void
  onBuyTickets: (eventId: string) => void
  userId: string
  showDescription?: boolean
  buttonVariant?: "default" | "purple"
}

export function RealTimeEventsGrid({ 
  events, 
  favoriteEvents, 
  onToggleFavorite, 
  onBuyTickets,
  userId
}: RealTimeEventsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <RealTimeEventCard
          key={event.id}
          event={event}
          isFavorite={favoriteEvents.has(event.id)}
          onToggleFavorite={onToggleFavorite}
          onBuyTickets={onBuyTickets}
          userId={userId}
        />
      ))}
    </div>
  )
}
