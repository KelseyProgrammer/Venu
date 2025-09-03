"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Ticket, DollarSign, Calendar, Music, X, Check } from 'lucide-react';
import { useFanRealTime, FanTicketUpdate, FanPriceUpdate, FanEventStatusUpdate, FanArtistNotification } from '@/hooks/useFanRealTime';

interface RealTimeFanNotificationsProps {
  userId: string;
  favoriteArtists?: string[];
  favoriteEvents?: string[];
  className?: string;
}

export function RealTimeFanNotifications({ 
  userId, 
  favoriteArtists = [], 
  favoriteEvents = [],
  className = "" 
}: RealTimeFanNotificationsProps) {
  const {
    ticketUpdates,
    lastTicketUpdate,
    priceUpdates,
    lastPriceUpdate,
    eventStatusUpdates,
    lastEventStatusUpdate,
    artistNotifications,
    unreadArtistNotifications,
    markArtistNotificationAsRead,
    markAllArtistNotificationsAsRead,
    isConnected,
    error
  } = useFanRealTime({
    userId,
    favoriteArtists,
    favoriteEvents
  });

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'ticket' | 'price' | 'status' | 'artist';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'tickets' | 'prices' | 'status' | 'artists'>('tickets');

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (lastTicketUpdate || lastPriceUpdate || lastEventStatusUpdate || unreadArtistNotifications > 0) {
      setShowNotifications(true);
      const timer = setTimeout(() => setShowNotifications(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastTicketUpdate, lastPriceUpdate, lastEventStatusUpdate, unreadArtistNotifications]);

  if (!isConnected) {
    return null; // Don't show notifications if not connected
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ticket':
        return <Ticket className="w-4 h-4" />;
      case 'price':
        return <DollarSign className="w-4 h-4" />;
      case 'status':
        return <Calendar className="w-4 h-4" />;
      case 'artist':
        return <Music className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'cancelled':
        return 'destructive';
      case 'rescheduled':
        return 'warning';
      case 'venue-changed':
      case 'time-changed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPriceChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'decrease':
        return 'success';
      case 'increase':
        return 'destructive';
      case 'dynamic':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {/* Connection Status */}
      {error && (
        <Card className="p-3 mb-2 bg-destructive/10 border-destructive">
          <div className="flex items-center gap-2 text-destructive text-sm">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span>Connection Error: {error}</span>
          </div>
        </Card>
      )}

      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        className="relative"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="w-4 h-4" />
        {(unreadArtistNotifications > 0 || ticketUpdates.length > 0 || priceUpdates.length > 0 || eventStatusUpdates.length > 0) && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
          >
            {unreadArtistNotifications + ticketUpdates.length + priceUpdates.length + eventStatusUpdates.length}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {showNotifications && (
        <Card className="mt-2 w-80 max-h-96 overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Real-time Updates</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="flex items-center gap-1">
                <Ticket className="w-3 h-3 text-blue-500" />
                <span>{ticketUpdates.length} ticket updates</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-500" />
                <span>{priceUpdates.length} price changes</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-orange-500" />
                <span>{eventStatusUpdates.length} status changes</span>
              </div>
              <div className="flex items-center gap-1">
                <Music className="w-3 h-3 text-purple-500" />
                <span>{unreadArtistNotifications} artist alerts</span>
              </div>
            </div>

            {/* Latest Updates */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {/* Latest Ticket Update */}
              {lastTicketUpdate && (
                <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Ticket className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="font-medium">Ticket Update</div>
                    <div className="text-muted-foreground">
                      {lastTicketUpdate.soldOut ? 'Sold Out!' : `${lastTicketUpdate.ticketsRemaining} tickets remaining`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(lastTicketUpdate.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Price Update */}
              {lastPriceUpdate && (
                <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-500 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="font-medium">Price Change</div>
                    <div className="text-muted-foreground">
                      ${lastPriceUpdate.oldPrice} → ${lastPriceUpdate.newPrice}
                    </div>
                    <Badge 
                      variant={getPriceChangeColor(lastPriceUpdate.changeType) as any}
                      className="text-xs mt-1"
                    >
                      {lastPriceUpdate.changeType}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(lastPriceUpdate.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Event Status Update */}
              {lastEventStatusUpdate && (
                <div className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <Calendar className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="font-medium">Event Status</div>
                    <div className="text-muted-foreground">
                      {lastEventStatusUpdate.oldStatus} → {lastEventStatusUpdate.newStatus}
                    </div>
                    <Badge 
                      variant={getStatusColor(lastEventStatusUpdate.statusType) as any}
                      className="text-xs mt-1"
                    >
                      {lastEventStatusUpdate.statusType}
                    </Badge>
                    {lastEventStatusUpdate.details && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {lastEventStatusUpdate.details}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(lastEventStatusUpdate.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Artist Notifications */}
              {artistNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-start gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <Music className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="font-medium">{notification.artistName}</div>
                    <div className="text-muted-foreground">{notification.message}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {notification.notificationType}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markArtistNotificationAsRead(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={markAllArtistNotificationsAsRead}
              >
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setShowNotifications(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
