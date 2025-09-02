"use client"

import { VerticalEventCard } from "./vertical-event-card"

interface Event {
  id: number
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
}

interface VerticalEventsGridProps {
  events: Event[]
  favoriteEvents: Set<number>
  onToggleFavorite: (eventId: number) => void
  onBuyTickets: (eventId: string) => void
  userId: string
  showDescription?: boolean
  buttonVariant?: "default" | "purple"
}

export function VerticalEventsGrid({ 
  events, 
  favoriteEvents, 
  onToggleFavorite, 
  onBuyTickets,
  userId,
  showDescription = true,
  buttonVariant = "default"
}: VerticalEventsGridProps) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <VerticalEventCard
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
