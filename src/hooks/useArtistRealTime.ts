import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { SocketNotification, SocketGigUpdate, SocketMessage } from '@/lib/socket';

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
  const { 
    socket, 
    connected, 
    autoConnect, 
    sendNotification: socketSendNotification, 
    sendGigUpdate: socketSendGigUpdate,
    sendMessage: socketSendMessage,
    onNotification, 
    onGigUpdate,
    onNewMessage,
    removeListener 
  } = useSocket();
  
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const [gigUpdates, setGigUpdates] = useState<SocketGigUpdate[]>([]);
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect when hook is used
  useEffect(() => {
    autoConnect().catch((err) => {
      console.error('Failed to auto-connect socket:', err);
      setError('Failed to connect to server');
    });
  }, [autoConnect]);

  // Listen for notifications
  useEffect(() => {
    const handleNotification = (notification: SocketNotification) => {
      // Filter notifications for this artist if artistId is provided
      if (!artistId || notification.to === artistId) {
        setNotifications(prev => [notification, ...prev].slice(0, 100));
      }
    };

    onNotification(handleNotification);

    return () => {
      removeListener('notification', handleNotification as (...args: unknown[]) => void);
    };
  }, [artistId, onNotification, removeListener]);

  // Listen for gig updates
  useEffect(() => {
    const handleGigUpdate = (update: SocketGigUpdate) => {
      setGigUpdates(prev => [update, ...prev].slice(0, 50));
    };

    onGigUpdate(handleGigUpdate);

    return () => {
      removeListener('gig-update', handleGigUpdate as (...args: unknown[]) => void);
    };
  }, [onGigUpdate, removeListener]);

  // Listen for messages
  useEffect(() => {
    const handleNewMessage = (message: SocketMessage) => {
      // For artist dashboard, we'll show messages from all locations
      setMessages(prev => [...prev, message]);
    };

    onNewMessage(handleNewMessage);

    return () => {
      removeListener('new-message', handleNewMessage as (...args: unknown[]) => void);
    };
  }, [onNewMessage, removeListener]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Send notification function
  const sendNotification = useCallback((targetUserId: string, type: string, title: string, message: string, data?: Record<string, unknown>) => {
    if (!connected) {
      setError('Not connected to server');
      return;
    }

    try {
      socketSendNotification(targetUserId, type, title, message, data);
      setError(null);
    } catch (err) {
      setError('Failed to send notification');
      console.error('Error sending notification:', err);
    }
  }, [connected, socketSendNotification]);

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

    try {
      socketSendGigUpdate(gigId, 'artist-dashboard', updateType, gigData);
      setError(null);
    } catch (err) {
      setError('Failed to send gig update');
      console.error('Error sending gig update:', err);
    }
  }, [connected, socketSendGigUpdate]);

  // Send message function
  const sendMessage = useCallback((message: string) => {
    if (!connected || !message.trim()) {
      return;
    }

    try {
      socketSendMessage('artist-dashboard', message.trim());
      setError(null);
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  }, [connected, socketSendMessage]);

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
    error
  };
};
