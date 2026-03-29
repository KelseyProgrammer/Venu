import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSocket } from '@/lib/socket';
import { SocketNotification, SocketGigUpdate, SocketMessage } from '@/lib/socket';
import { useStoredNotifications } from './useStoredNotifications';

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
  clearAllNotifications: () => void;
  
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

// Helper function to get user email from stored user object (avoids client-side JWT parsing)
const getUserEmailFromUserId = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return '';
    const user = JSON.parse(userStr);
    return user.email || '';
  } catch {
    return '';
  }
};

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
          // Artists see updates for gigs they're involved in
          // Check if the artist's email is in the bands array
          const artistEmail = getUserEmailFromUserId();
          if (artistEmail && update.gigData.bands && Array.isArray(update.gigData.bands)) {
            const isArtistInGig = update.gigData.bands.some((band: { email?: string }) => 
              band.email && band.email.toLowerCase() === artistEmail.toLowerCase()
            );
            if (isArtistInGig) {
              setGigUpdates(prev => [update, ...prev].slice(0, 50));
            }
          }
        },
        onMessage: (message: SocketMessage) => {
          // Artists see messages from locations they're booked at
          if (message.locationId && artistId) {
            setMessages(prev => [...prev, message].slice(0, 100));
          }
        },
        onNotification: (notification: SocketNotification) => {
          console.log(`🔔 ARTIST HOOK: Received notification:`, {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            to: notification.to,
            userId,
            artistId,
            matches: notification.to === userId || notification.to === artistId
          });
          // Check if notification is for this user (either by userId or artistId)
          if (notification.to === userId || notification.to === artistId) {
            console.log(`✅ ARTIST HOOK: Notification accepted for user`);
            setNotifications(prev => [notification, ...prev].slice(0, 100));
          } else {
            console.log(`❌ ARTIST HOOK: Notification rejected - not for this user`);
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

  // Clear all in-memory real-time notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
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
    clearAllNotifications,
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
  clearAllNotifications: () => void;

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
  // Get user info from stored user object (avoids client-side JWT parsing)
  const getUserId = (): string => {
    if (typeof window === 'undefined') return '';
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return '';
      const user = JSON.parse(userStr);
      return user._id || user.id || '';
    } catch {
      return '';
    }
  };

  const getUserRole = (): string => {
    if (typeof window === 'undefined') return '';
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return localStorage.getItem('userRole') || '';
      const user = JSON.parse(userStr);
      return user.role || localStorage.getItem('userRole') || '';
    } catch {
      return localStorage.getItem('userRole') || '';
    }
  };

  const userId = getUserId();
  const userRole = getUserRole();
  const currentArtistId = artistId || userId;

  // Get stored notifications for the current user
  const {
    notifications: storedNotifications,
    markAsRead: markStoredAsRead,
    markAllAsRead: markAllStoredAsRead,
    clearAllNotifications: clearAllStoredNotifications,
  } = useStoredNotifications(currentArtistId);

  const unifiedHook = useUnifiedRealTime({
    userId,
    userRole,
    artistId: currentArtistId,
    locationId: 'artist-dashboard' // Default location for artist dashboard
  });

  // Destructure the clearAllNotifications function from unifiedHook
  const { clearAllNotifications: clearAllUnifiedNotifications } = unifiedHook;

  // Combine stored and real-time notifications
  const allNotifications = [...unifiedHook.notifications, ...storedNotifications];
  
  // Remove duplicates based on notification ID
  const uniqueNotifications = allNotifications.reduce(
    (acc: SocketNotification[], notification: SocketNotification) => {
      if (!acc.find((n: SocketNotification) => n.id === notification.id)) {
        acc.push(notification);
      }
      return acc;
    },
    []
  );

  // Sort by timestamp (newest first)
  const sortedNotifications = uniqueNotifications.sort(
    (a: SocketNotification, b: SocketNotification) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Calculate total unread count
  const totalUnreadCount = sortedNotifications.filter(
    (n: SocketNotification) => !n.read
  ).length;

  // Enhanced mark as read function
  const markAsRead = useCallback(async (notificationId: string) => {
    // Update real-time notifications
    unifiedHook.markAsRead(notificationId);

    // Mark as read in backend if it's a stored notification
    const isStoredNotification = storedNotifications.some(n => n.id === notificationId);
    if (isStoredNotification) {
      await markStoredAsRead(notificationId);
    }
  }, [unifiedHook.markAsRead, markStoredAsRead, storedNotifications]);

  // Enhanced mark all as read function
  const markAllAsRead = useCallback(async () => {
    // Update real-time notifications
    unifiedHook.markAllAsRead();

    // Mark all stored notifications as read
    await markAllStoredAsRead();
  }, [unifiedHook.markAllAsRead, markAllStoredAsRead]);

  // Enhanced clear all notifications function
  const clearAllNotifications = useCallback(async () => {
    // Clear real-time notifications
    if (clearAllUnifiedNotifications) {
      clearAllUnifiedNotifications();
    }

    // Clear stored notifications
    await clearAllStoredNotifications();
  }, [clearAllUnifiedNotifications, clearAllStoredNotifications]);

  return {
    ...unifiedHook,
    notifications: sortedNotifications,
    unreadCount: totalUnreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  };
};
