import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSocket } from '@/lib/socket';
import { SocketNotification, SocketGigUpdate, SocketMessage } from '@/lib/socket';

interface UseUnifiedRealTimeProps {
  userId: string;
  userRole: string;
  locationId?: string;
  artistId?: string;
  promoterId?: string;
}

interface UseUnifiedRealTimeReturn {
  // Notifications
  notifications: SocketNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  
  // Gig Updates
  gigUpdates: SocketGigUpdate[];
  sendGigUpdate: (gigId: string, updateType: string, gigData: Record<string, unknown>) => void;
  
  // Chat
  messages: SocketMessage[];
  sendMessage: (message: string) => void;
  typingUsers: string[];
  
  // Connection
  isConnected: boolean;
  error: string | null;
  
  // Event handlers for role-specific functionality
  eventHandlers: {
    onGigUpdate: (update: SocketGigUpdate) => void;
    onMessage: (message: SocketMessage) => void;
    onNotification: (notification: SocketNotification) => void;
  };
}

export const useUnifiedRealTime = (config: UseUnifiedRealTimeProps): UseUnifiedRealTimeReturn => {
  const { userId, userRole, locationId, artistId } = config;
  
  const { 
    connected, 
    autoConnect, 
    sendGigUpdate: socketSendGigUpdate,
    sendMessage: socketSendMessage,
    onNotification, 
    onGigUpdate,
    onNewMessage,
    removeListener 
  } = useSocket();
  
  // Shared state across all dashboards
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const [gigUpdates, setGigUpdates] = useState<SocketGigUpdate[]>([]);
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [typingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect when hook is used
  useEffect(() => {
    autoConnect().catch((err) => {
      console.error('Failed to auto-connect socket:', err);
      setError('Failed to connect to server');
    });
  }, [autoConnect]);

  // Role-specific event handlers
  const eventHandlers = useMemo(() => {
    const handlers = {
      'location-owner': {
        onGigUpdate: (update: SocketGigUpdate) => {
          if (update.locationId === locationId) {
            setGigUpdates(prev => [update, ...prev].slice(0, 50));
          }
        },
        onMessage: (message: SocketMessage) => {
          if (message.locationId === locationId) {
            setMessages(prev => [...prev, message].slice(0, 100));
          }
        },
        onNotification: (notification: SocketNotification) => {
          if (notification.to === userId) {
            setNotifications(prev => [notification, ...prev].slice(0, 100));
          }
        }
      },
      'artist': {
        onGigUpdate: (update: SocketGigUpdate) => {
          // Artists see updates for their bookings
          if (update.gigData.artistId === artistId) {
            setGigUpdates(prev => [update, ...prev].slice(0, 50));
          }
        },
        onMessage: (message: SocketMessage) => {
          // Artists see messages from locations they're booked at
          if (message.locationId && artistId) {
            setMessages(prev => [...prev, message].slice(0, 100));
          }
        },
        onNotification: (notification: SocketNotification) => {
          if (notification.to === artistId) {
            setNotifications(prev => [notification, ...prev].slice(0, 100));
          }
        }
      },
      'promoter': {
        onGigUpdate: (update: SocketGigUpdate) => {
          // Promoters see updates for their managed locations
          if (update.locationId === locationId) {
            setGigUpdates(prev => [update, ...prev].slice(0, 50));
          }
        },
        onMessage: (message: SocketMessage) => {
          if (message.locationId === locationId) {
            setMessages(prev => [...prev, message].slice(0, 100));
          }
        },
        onNotification: (notification: SocketNotification) => {
          if (notification.to === userId) {
            setNotifications(prev => [notification, ...prev].slice(0, 100));
          }
        }
      }
    };
    
    return handlers[userRole as keyof typeof handlers] || {
      onGigUpdate: () => {},
      onMessage: () => {},
      onNotification: () => {}
    };
  }, [userRole, locationId, artistId, userId]);

  // Listen for notifications
  useEffect(() => {
    const handleNotification = eventHandlers.onNotification;
    onNotification(handleNotification);

    return () => {
      removeListener('notification', handleNotification as (...args: unknown[]) => void);
    };
  }, [eventHandlers.onNotification, onNotification, removeListener]);

  // Listen for gig updates
  useEffect(() => {
    const handleGigUpdate = eventHandlers.onGigUpdate;
    onGigUpdate(handleGigUpdate);

    return () => {
      removeListener('gig-update', handleGigUpdate as (...args: unknown[]) => void);
    };
  }, [eventHandlers.onGigUpdate, onGigUpdate, removeListener]);

  // Listen for messages
  useEffect(() => {
    const handleNewMessage = eventHandlers.onMessage;
    onNewMessage(handleNewMessage);

    return () => {
      removeListener('new-message', handleNewMessage as (...args: unknown[]) => void);
    };
  }, [eventHandlers.onMessage, onNewMessage, removeListener]);

  // Calculate unread count
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Send gig update function
  const sendGigUpdate = useCallback((gigId: string, updateType: string, gigData: Record<string, unknown>) => {
    if (!connected) {
      setError('Not connected to server');
      return;
    }

    if (!locationId) {
      setError('Location ID required for gig updates');
      return;
    }

    try {
      socketSendGigUpdate(gigId, locationId, updateType, gigData);
      setError(null);
    } catch (err) {
      setError('Failed to send gig update');
      console.error('Error sending gig update:', err);
    }
  }, [connected, locationId, socketSendGigUpdate]);

  // Send message function
  const sendMessage = useCallback((message: string) => {
    if (!connected || !message.trim()) {
      return;
    }

    if (!locationId) {
      setError('Location ID required for messaging');
      return;
    }

    try {
      const success = socketSendMessage(locationId, message.trim());
      if (!success) {
        setError('Rate limit exceeded or connection lost');
      } else {
        setError(null);
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  }, [connected, locationId, socketSendMessage]);

  // Clear error when connection is restored
  useEffect(() => {
    if (connected) {
      setError(null);
    }
  }, [connected]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    gigUpdates,
    sendGigUpdate,
    messages,
    sendMessage,
    typingUsers,
    isConnected: connected,
    error,
    eventHandlers
  };
};

// Legacy useArtistRealTime for backward compatibility
interface UseArtistRealTimeProps {
  artistId?: string;
}

interface UseArtistRealTimeReturn {
  // Notifications
  notifications: SocketNotification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  
  // Gig Updates
  gigUpdates: SocketGigUpdate[];
  sendGigUpdate: (gigId: string, updateType: string, gigData: Record<string, unknown>) => void;
  
  // Chat
  messages: SocketMessage[];
  sendMessage: (message: string) => void;
  typingUsers: string[];
  
  // Connection
  isConnected: boolean;
  error: string | null;
}

export const useArtistRealTime = ({ artistId }: UseArtistRealTimeProps = {}): UseArtistRealTimeReturn => {
  // Get user info from localStorage for backward compatibility
  const getUserId = (): string => {
    if (typeof window === 'undefined') return '';
    try {
      const token = localStorage.getItem('authToken');
      if (!token || token.length < 10 || !token.includes('.')) {
        console.log('🔐 Invalid token in getUserId, clearing...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        return '';
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || '';
    } catch {
      console.log('🔐 Error parsing token in getUserId, clearing...');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      return '';
    }
  };

  const getUserRole = (): string => {
    if (typeof window === 'undefined') return '';
    try {
      const token = localStorage.getItem('authToken');
      if (!token || token.length < 10 || !token.includes('.')) {
        console.log('🔐 Invalid token in getUserRole, clearing...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        return '';
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || '';
    } catch {
      console.log('🔐 Error parsing token in getUserRole, clearing...');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      return '';
    }
  };

  const userId = getUserId();
  const userRole = getUserRole();

  const unifiedHook = useUnifiedRealTime({
    userId,
    userRole,
    artistId: artistId || '',
    locationId: 'artist-dashboard' // Default location for artist dashboard
  });

  return unifiedHook;
};
