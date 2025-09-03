"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Star, Users, Heart, Ticket } from "lucide-react"
import Image from "next/image"
import { getLocationDisplayName } from "@/lib/location-data"

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
  numberOfBands?: number // Total expected bands
  bands?: any[] // Array of confirmed bands
}

interface EventCardProps {
  event: Event
  isFavorite: boolean
  onToggleFavorite: (eventId: number) => void
  onBuyTickets: (eventId: string) => void
  showDescription?: boolean
  buttonVariant?: "default" | "purple"
}

export function EventCard({ 
  event, 
  isFavorite, 
  onToggleFavorite, 
  onBuyTickets,
  showDescription = true,
  buttonVariant = "default"
}: EventCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={event.image}
          alt={event.artist}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background/90"
          onClick={() => onToggleFavorite(event.id)}
        >
          <Heart 
            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
          />
        </Button>
        <Badge className="absolute top-2 left-2 bg-primary/90 text-white">
          ${event.ticketPrice}
        </Badge>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground">{event.artist}</h3>
          <p className="text-sm text-muted-foreground">{getLocationDisplayName(event.location)}</p>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {event.date}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {event.time}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{event.genre}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {event.rating}
          </div>
        </div>
        
        {/* Band Lineup Status */}
        {event.numberOfBands && event.bands && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {event.bands.length}/{event.numberOfBands} Bands
            </span>
            {event.bands.length < event.numberOfBands && (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                {event.numberOfBands - event.bands.length} needed
              </div>
            )}
          </div>
        )}
        
        {showDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {event.ticketsRemaining} tickets left
          </div>
          <Button 
            variant={buttonVariant}
            size="sm"
            onClick={() => onBuyTickets(event.id.toString())}
          >
            <Ticket className="w-4 h-4 mr-2" />
            Buy Tickets
          </Button>
        </div>
      </div>
    </Card>
  )
}
