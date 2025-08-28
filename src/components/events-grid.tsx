"use client"

import { EventCard } from "./event-card"

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

interface EventsGridProps {
  events: Event[]
  favoriteEvents: Set<number>
  onToggleFavorite: (eventId: number) => void
  onBuyTickets: (eventId: string) => void
  showDescription?: boolean
  buttonVariant?: "default" | "purple"
}

export function EventsGrid({ 
  events, 
  favoriteEvents, 
  onToggleFavorite, 
  onBuyTickets,
  showDescription = true,
  buttonVariant = "default"
}: EventsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isFavorite={favoriteEvents.has(event.id)}
          onToggleFavorite={onToggleFavorite}
          onBuyTickets={onBuyTickets}
          showDescription={showDescription}
          buttonVariant={buttonVariant}
        />
      ))}
    </div>
  )
}
