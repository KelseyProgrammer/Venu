import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSocket } from '@/lib/socket';

// Fan-specific Socket.IO types
export interface FanTicketUpdate {
  eventId: string;
  ticketsRemaining: number;
  totalTickets: number;
  soldOut: boolean;
  timestamp: string;
}

export interface FanPriceUpdate {
  eventId: string;
  oldPrice: number;
  newPrice: number;
  changeType: 'increase' | 'decrease' | 'dynamic';
  timestamp: string;
}

export interface FanEventStatusUpdate {
  eventId: string;
  oldStatus: string;
  newStatus: string;
  statusType: 'cancelled' | 'rescheduled' | 'venue-changed' | 'time-changed';
  details?: string;
  timestamp: string;
}

export interface FanArtistNotification {
  id: string;
  artistId: string;
  artistName: string;
  eventId: string;
  eventTitle: string;
  notificationType: 'new-gig' | 'gig-cancelled' | 'gig-rescheduled' | 'price-drop';
  message: string;
  timestamp: string;
  read: boolean;
}

interface UseFanRealTimeProps {
  userId: string;
  favoriteArtists?: string[];
  favoriteEvents?: string[];
}

interface UseFanRealTimeReturn {
  // Ticket availability updates
  ticketUpdates: FanTicketUpdate[];
  lastTicketUpdate: FanTicketUpdate | null;
  
  // Price change updates
  priceUpdates: FanPriceUpdate[];
  lastPriceUpdate: FanPriceUpdate | null;
  
  // Event status updates
  eventStatusUpdates: FanEventStatusUpdate[];
  lastEventStatusUpdate: FanEventStatusUpdate | null;
  
  // Artist notifications
  artistNotifications: FanArtistNotification[];
  unreadArtistNotifications: number;
  markArtistNotificationAsRead: (notificationId: string) => void;
  markAllArtistNotificationsAsRead: () => void;
  
  // Connection status
  isConnected: boolean;
  error: string | null;
  
  // Utility functions
  subscribeToEvent: (eventId: string) => void;
  unsubscribeFromEvent: (eventId: string) => void;
  subscribeToArtist: (artistId: string) => void;
  unsubscribeFromArtist: (artistId: string) => void;
}

export const useFanRealTime = (config: UseFanRealTimeProps): UseFanRealTimeReturn => {
  const { userId, favoriteArtists = [], favoriteEvents = [] } = config;
  
  const { 
    connected, 
    autoConnect,
    socket,
    onNotification,
    removeListener 
  } = useSocket();
  
  // State for real-time updates
  const [ticketUpdates, setTicketUpdates] = useState<FanTicketUpdate[]>([]);
  const [priceUpdates, setPriceUpdates] = useState<FanPriceUpdate[]>([]);
  const [eventStatusUpdates, setEventStatusUpdates] = useState<FanEventStatusUpdate[]>([]);
  const [artistNotifications, setArtistNotifications] = useState<FanArtistNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect when hook is used
  useEffect(() => {
    autoConnect().catch((err) => {
      console.error('Failed to auto-connect socket:', err);
      setError('Failed to connect to server');
    });
  }, [autoConnect]);

  // Subscribe to favorite events for real-time updates
  useEffect(() => {
    if (!connected || !socket) return;

    // Join event-specific rooms for real-time updates
    favoriteEvents.forEach(eventId => {
      socket.emit('join-event', eventId);
    });

    return () => {
      // Leave event rooms on cleanup
      favoriteEvents.forEach(eventId => {
        socket.emit('leave-event', eventId);
      });
    };
  }, [connected, socket, favoriteEvents]);

  // Subscribe to favorite artists for notifications
  useEffect(() => {
    if (!connected || !socket) return;

    // Join artist-specific rooms for notifications
    favoriteArtists.forEach(artistId => {
      socket.emit('join-artist', artistId);
    });

    return () => {
      // Leave artist rooms on cleanup
      favoriteArtists.forEach(artistId => {
        socket.emit('leave-artist', artistId);
      });
    };
  }, [connected, socket, favoriteArtists]);

  // Listen for ticket availability updates
  useEffect(() => {
    if (!socket) return;

    const handleTicketUpdate = (update: FanTicketUpdate) => {
      setTicketUpdates(prev => [update, ...prev].slice(0, 50));
    };

    socket.on('ticket-update', handleTicketUpdate);

    return () => {
      socket.off('ticket-update', handleTicketUpdate);
    };
  }, [socket]);

  // Listen for price change updates
  useEffect(() => {
    if (!socket) return;

    const handlePriceUpdate = (update: FanPriceUpdate) => {
      setPriceUpdates(prev => [update, ...prev].slice(0, 50));
    };

    socket.on('price-update', handlePriceUpdate);

    return () => {
      socket.off('price-update', handlePriceUpdate);
    };
  }, [socket]);

  // Listen for event status updates
  useEffect(() => {
    if (!socket) return;

    const handleEventStatusUpdate = (update: FanEventStatusUpdate) => {
      setEventStatusUpdates(prev => [update, ...prev].slice(0, 50));
    };

    socket.on('event-status-update', handleEventStatusUpdate);

    return () => {
      socket.off('event-status-update', handleEventStatusUpdate);
    };
  }, [socket]);

  // Listen for artist notifications
  useEffect(() => {
    if (!socket) return;

    const handleArtistNotification = (notification: FanArtistNotification) => {
      setArtistNotifications(prev => [notification, ...prev].slice(0, 100));
    };

    socket.on('artist-notification', handleArtistNotification);

    return () => {
      socket.off('artist-notification', handleArtistNotification);
    };
  }, [socket]);

  // Calculate unread artist notifications
  const unreadArtistNotifications = useMemo(() => 
    artistNotifications.filter(n => !n.read).length, 
    [artistNotifications]
  );

  // Mark artist notification as read
  const markArtistNotificationAsRead = useCallback((notificationId: string) => {
    setArtistNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all artist notifications as read
  const markAllArtistNotificationsAsRead = useCallback(() => {
    setArtistNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Subscribe to specific event for real-time updates
  const subscribeToEvent = useCallback((eventId: string) => {
    if (!connected || !socket) {
      setError('Not connected to server');
      return;
    }

    try {
      socket.emit('join-event', eventId);
      setError(null);
    } catch (err) {
      setError('Failed to subscribe to event');
      console.error('Error subscribing to event:', err);
    }
  }, [connected, socket]);

  // Unsubscribe from specific event
  const unsubscribeFromEvent = useCallback((eventId: string) => {
    if (!connected || !socket) return;

    try {
      socket.emit('leave-event', eventId);
    } catch (err) {
      console.error('Error unsubscribing from event:', err);
    }
  }, [connected, socket]);

  // Subscribe to specific artist for notifications
  const subscribeToArtist = useCallback((artistId: string) => {
    if (!connected || !socket) {
      setError('Not connected to server');
      return;
    }

    try {
      socket.emit('join-artist', artistId);
      setError(null);
    } catch (err) {
      setError('Failed to subscribe to artist');
      console.error('Error subscribing to artist:', err);
    }
  }, [connected, socket]);

  // Unsubscribe from specific artist
  const unsubscribeFromArtist = useCallback((artistId: string) => {
    if (!connected || !socket) return;

    try {
      socket.emit('leave-artist', artistId);
    } catch (err) {
      console.error('Error unsubscribing from artist:', err);
    }
  }, [connected, socket]);

  // Get latest updates
  const lastTicketUpdate = useMemo(() => 
    ticketUpdates[0] || null, 
    [ticketUpdates]
  );

  const lastPriceUpdate = useMemo(() => 
    priceUpdates[0] || null, 
    [priceUpdates]
  );

  const lastEventStatusUpdate = useMemo(() => 
    eventStatusUpdates[0] || null, 
    [eventStatusUpdates]
  );

  // Clear error when connection is restored
  useEffect(() => {
    if (connected) {
      setError(null);
    }
  }, [connected]);

  return {
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
    isConnected: connected,
    error,
    subscribeToEvent,
    unsubscribeFromEvent,
    subscribeToArtist,
    unsubscribeFromArtist
  };
};
