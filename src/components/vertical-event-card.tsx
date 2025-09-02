"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Ticket, DollarSign, Calendar, Clock, MapPin, Star, Share2 } from 'lucide-react';
import Image from 'next/image';
import { getLocationDisplayName } from '@/lib/location-data';
import { useFanRealTime } from '@/hooks/useFanRealTime';

interface Event {
  id: number;
  artist: string;
  location: string;
  address: string;
  date: string;
  time: string;
  genre: string;
  ticketPrice: number;
  ticketsRemaining: number;
  totalTickets: number;
  rating: number;
  description: string;
  image: string;
  tags: string[];
}

interface VerticalEventCardProps {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: (eventId: number) => void;
  onBuyTickets: (eventId: string) => void;
  userId: string;
  className?: string;
}

export function VerticalEventCard({ 
  event, 
  isFavorite, 
  onToggleFavorite, 
  onBuyTickets,
  userId,
  className = "" 
}: VerticalEventCardProps) {
  const [localTicketsRemaining, setLocalTicketsRemaining] = useState(event.ticketsRemaining);
  const [localTicketPrice, setLocalTicketPrice] = useState(event.ticketPrice);
  const [showPriceChange, setShowPriceChange] = useState(false);
  const [showTicketUpdate, setShowTicketUpdate] = useState(false);

  // Subscribe to real-time updates for this event
  const { subscribeToEvent, unsubscribeFromEvent } = useFanRealTime({
    userId,
    favoriteEvents: [event.id.toString()]
  });

  // Subscribe to event updates when component mounts
  useEffect(() => {
    subscribeToEvent(event.id.toString());

    return () => {
      unsubscribeFromEvent(event.id.toString());
    };
  }, [event.id, subscribeToEvent, unsubscribeFromEvent]);

  // Listen for real-time updates
  useEffect(() => {
    // This would be handled by the useFanRealTime hook
    // For now, we'll simulate updates
    const simulateUpdates = () => {
      // Simulate ticket availability changes
      if (Math.random() > 0.7) {
        const newTicketsRemaining = Math.max(0, localTicketsRemaining - Math.floor(Math.random() * 5));
        if (newTicketsRemaining !== localTicketsRemaining) {
          setLocalTicketsRemaining(newTicketsRemaining);
          setShowTicketUpdate(true);
          setTimeout(() => setShowTicketUpdate(false), 3000);
        }
      }

      // Simulate price changes
      if (Math.random() > 0.9) {
        const priceChange = Math.random() > 0.5 ? 5 : -5;
        const newPrice = Math.max(10, localTicketPrice + priceChange);
        if (newPrice !== localTicketPrice) {
          setLocalTicketPrice(newPrice);
          setShowPriceChange(true);
          setTimeout(() => setShowPriceChange(false), 3000);
        }
      }
    };

    const interval = setInterval(simulateUpdates, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [localTicketsRemaining, localTicketPrice]);

  const isSoldOut = localTicketsRemaining === 0;
  const isLowStock = localTicketsRemaining <= 5 && localTicketsRemaining > 0;

  // Parse date for prominent display
  const dateParts = event.date.split(', ');
  const dayOfWeek = dateParts[0]; // "Sat"
  const monthDay = dateParts[1]; // "Oct 12"

  return (
    <Card className={`p-6 bg-card border-border relative overflow-hidden hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {/* Real-time indicators */}
      {showTicketUpdate && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="destructive" className="animate-pulse">
            <Ticket className="w-3 h-3 mr-1" />
            {localTicketsRemaining} left!
          </Badge>
        </div>
      )}

      {showPriceChange && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="secondary" className="animate-pulse">
            <DollarSign className="w-3 h-3 mr-1" />
            Price Updated!
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-6">
        {/* Prominent Date Display */}
        <div className="flex-shrink-0 text-center">
          <div className="bg-purple-600 text-white rounded-lg p-4 min-w-[80px]">
            <div className="text-2xl font-bold">{dayOfWeek}</div>
            <div className="text-sm font-medium">{monthDay}</div>
            <div className="text-xs mt-1 opacity-90">{event.time}</div>
          </div>
          {isLowStock && (
            <Badge variant="destructive" className="text-xs mt-2 w-full">
              Low Stock
            </Badge>
          )}
          {isSoldOut && (
            <Badge variant="destructive" className="text-xs mt-2 w-full">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Event Image */}
        <div className="flex-shrink-0 relative">
          <Image
            src={event.image}
            alt={event.artist}
            width={120}
            height={120}
            className="rounded-lg object-cover"
          />
        </div>
        
        {/* Event Details */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-xl text-foreground mb-1">{event.artist}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                <Badge variant="outline" className="text-xs">
                  {event.genre}
                </Badge>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {event.rating}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(event.id)}
              className={`h-8 w-8 p-0 ${isFavorite ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{getLocationDisplayName(event.location)}</span>
            </div>
          </div>
          
          {/* Price and Ticket Info */}
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  ${localTicketPrice}
                </span>
                {showPriceChange && (
                  <Badge variant="outline" className="text-xs animate-pulse">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Live Price
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ticket className="w-4 h-4" />
                <span>
                  {isSoldOut ? 'Sold Out' : `${localTicketsRemaining} tickets remaining`}
                </span>
                {showTicketUpdate && (
                  <Badge variant="outline" className="text-xs animate-pulse">
                    Live
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="default"
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                onClick={() => onBuyTickets(event.id.toString())}
                disabled={isSoldOut}
              >
                {isSoldOut ? 'Sold Out' : 'Buy Tickets'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        {event.tags.slice(0, 4).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {event.tags.length > 4 && (
          <Badge variant="outline" className="text-xs">
            +{event.tags.length - 4} more
          </Badge>
        )}
      </div>
    </Card>
  );
}
