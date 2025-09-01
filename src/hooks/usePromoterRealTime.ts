import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { useNotifications } from './useNotifications';
import { useGigUpdates } from './useGigUpdates';
import { useChat } from './useChat';
import { SocketMessage, SocketNotification, SocketGigUpdate } from '@/lib/socket';

interface UsePromoterRealTimeProps {
  promoterId?: string;
  selectedLocation?: string;
}

interface GigUpdate {
  gigId: string;
  updateType: string;
  gigData: Record<string, unknown>;
}

interface UsePromoterRealTimeReturn {
  // Notifications
  notifications: SocketNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  
  // Gig Updates
  gigUpdates: SocketGigUpdate[];
  sendGigUpdate: (update: GigUpdate) => void;
  
  // Chat
  messages: SocketMessage[];
  sendMessage: (message: string) => void;
  typingUsers: string[];
  
  // Connection status
  isConnected: boolean;
  error: string | null;
}

export const usePromoterRealTime = ({ 
  promoterId = "promoter-123", 
  selectedLocation = "all" 
}: UsePromoterRealTimeProps): UsePromoterRealTimeReturn => {
  const { connected, autoConnect } = useSocket();
  const [error, setError] = useState<string | null>(null);
  
  // Use existing hooks
  const notificationsHook = useNotifications();
  const gigUpdatesHook = useGigUpdates({ locationId: selectedLocation });
  const chatHook = useChat({ 
    locationId: selectedLocation === "all" ? "promoter-global" : selectedLocation, 
    currentUserId: promoterId 
  });

  // Auto-connect when hook is used
  useEffect(() => {
    autoConnect().catch((err) => {
      console.error('Failed to auto-connect socket:', err);
      setError('Failed to connect to server');
    });
  }, [autoConnect]);

  // Clear error when connection is restored
  useEffect(() => {
    if (connected) {
      setError(null);
    }
  }, [connected]);

  // Enhanced send message for promoter context
  const sendMessage = useCallback((message: string) => {
    if (!connected || !message.trim()) {
      return;
    }

    try {
      chatHook.sendMessage(message);
      setError(null);
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  }, [connected, chatHook]);

  // Enhanced gig update for promoter context
  const sendGigUpdate = useCallback((update: GigUpdate) => {
    if (!connected) {
      return;
    }

    try {
      const { gigId, updateType, gigData } = update;
      gigUpdatesHook.sendGigUpdate(gigId, updateType, gigData);
      setError(null);
    } catch (err) {
      setError('Failed to send gig update');
      console.error('Error sending gig update:', err);
    }
  }, [connected, gigUpdatesHook]);

  return {
    // Notifications
    notifications: notificationsHook.notifications,
    unreadCount: notificationsHook.unreadCount,
    markAsRead: notificationsHook.markAsRead,
    markAllAsRead: notificationsHook.markAllAsRead,
    
    // Gig Updates
    gigUpdates: gigUpdatesHook.gigUpdates,
    sendGigUpdate,
    
    // Chat
    messages: chatHook.messages,
    sendMessage,
    typingUsers: chatHook.typingUsers,
    
    // Connection status
    isConnected: connected,
    error
  };
};
