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
  id: string;
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

interface RealTimeEventCardProps {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
  onBuyTickets: (eventId: string) => void;
  userId: string;
  className?: string;
}

export function RealTimeEventCard({ 
  event, 
  isFavorite, 
  onToggleFavorite, 
  onBuyTickets,
  userId,
  className = "" 
}: RealTimeEventCardProps) {
  const [localTicketsRemaining, setLocalTicketsRemaining] = useState(event.ticketsRemaining);
  const [localTicketPrice, setLocalTicketPrice] = useState(event.ticketPrice);
  const [showPriceChange, setShowPriceChange] = useState(false);
  const [showTicketUpdate, setShowTicketUpdate] = useState(false);

  // Subscribe to real-time updates for this event
  const { subscribeToEvent, unsubscribeFromEvent } = useFanRealTime({
    userId,
    favoriteEvents: [event.id]
  });

  // Subscribe to event updates when component mounts
  useEffect(() => {
    subscribeToEvent(event.id);

    return () => {
      unsubscribeFromEvent(event.id);
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

  return (
    <Card className={`p-4 bg-card border-border relative overflow-hidden ${className}`}>
      {/* Real-time indicators */}
      {showTicketUpdate && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="destructive" className="animate-pulse">
            <Ticket className="w-3 h-3 mr-1" />
            {localTicketsRemaining} left!
          </Badge>
        </div>
      )}

      {showPriceChange && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="animate-pulse">
            <DollarSign className="w-3 h-3 mr-1" />
            Price Updated!
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="relative">
          <Image
            src={event.image}
            alt={event.artist}
            width={80}
            height={80}
            className="rounded-lg object-cover"
          />
          {isLowStock && (
            <div className="absolute -top-1 -right-1">
              <Badge variant="destructive" className="text-xs">
                Low Stock
              </Badge>
            </div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Badge variant="destructive" className="text-xs">
                Sold Out
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{event.artist}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{getLocationDisplayName(event.location)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{event.time}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-foreground">
                  ${localTicketPrice}
                </span>
                {showPriceChange && (
                  <Badge variant="outline" className="text-xs animate-pulse">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Live Price
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Ticket className="w-3 h-3" />
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
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => onBuyTickets(event.id)}
                disabled={isSoldOut}
              >
                {isSoldOut ? 'Sold Out' : 'Buy Tickets'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border">
        {event.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {event.tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{event.tags.length - 3} more
          </Badge>
        )}
      </div>
    </Card>
  );
}
