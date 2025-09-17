import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { SocketNotification } from '@/lib/socket';
import { useStoredNotifications } from './useStoredNotifications';

interface UseNotificationsReturn {
  notifications: SocketNotification[];
  unreadCount: number;
  sendNotification: (targetUserId: string, type: string, title: string, message: string, data?: Record<string, unknown>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  isConnected: boolean;
  error: string | null;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
}

export const useNotifications = (userId?: string): UseNotificationsReturn => {
  const { connected, autoConnect, sendNotification: socketSendNotification, onNotification, removeListener } = useSocket();
  const [realTimeNotifications, setRealTimeNotifications] = useState<SocketNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get stored notifications
  const {
    notifications: storedNotifications,
    unreadCount: storedUnreadCount,
    isLoading,
    markAsRead: markStoredAsRead,
    markAllAsRead: markAllStoredAsRead,
    clearAllNotifications: clearAllStoredNotifications,
    refreshNotifications
  } = useStoredNotifications(userId);

  // Auto-connect when hook is used
  useEffect(() => {
    autoConnect().catch((err) => {
      console.error('Failed to auto-connect socket:', err);
      setError('Failed to connect to server');
    });
  }, [autoConnect]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNotification = (notification: SocketNotification) => {
      console.log(`🔔 FRONTEND: Received real-time notification:`, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        to: notification.to,
        from: notification.from
      });
      setRealTimeNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 real-time notifications
    };

    onNotification(handleNotification);

    return () => {
      removeListener('notification', handleNotification as (...args: unknown[]) => void);
    };
  }, [onNotification, removeListener]);

  // Combine stored and real-time notifications
  const allNotifications = [...realTimeNotifications, ...storedNotifications];
  
  // Remove duplicates based on notification ID
  const uniqueNotifications = allNotifications.reduce((acc, notification) => {
    if (!acc.find(n => n.id === notification.id)) {
      acc.push(notification);
    }
    return acc;
  }, [] as SocketNotification[]);

  // Sort by timestamp (newest first)
  const sortedNotifications = uniqueNotifications.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Calculate total unread count
  const totalUnreadCount = sortedNotifications.filter(n => !n.read).length;

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

  // Mark notification as read (both real-time and stored)
  const markAsRead = useCallback(async (notificationId: string) => {
    // Update real-time notifications
    setRealTimeNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );

    // Mark as read in backend if it's a stored notification
    const isStoredNotification = storedNotifications.some(n => n.id === notificationId);
    if (isStoredNotification) {
      await markStoredAsRead(notificationId);
    }
  }, [markStoredAsRead, storedNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // Update real-time notifications
    setRealTimeNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Mark all stored notifications as read
    await markAllStoredAsRead();
  }, [markAllStoredAsRead]);

  // Clear all notifications (both real-time and stored, preserving gig confirmations)
  const clearAllNotifications = useCallback(async () => {
    console.log('🗑️ useNotifications: clearAllNotifications called for userId:', userId);
    
    // Clear real-time notifications (but preserve gig-confirmation-required with pending-confirmation)
    setRealTimeNotifications(prev => {
      const filtered = prev.filter(notification => 
        !(notification.type === 'gig-confirmation-required' && 
          notification.data?.status === 'pending-confirmation')
      );
      console.log('🗑️ useNotifications: Cleared real-time notifications, remaining:', filtered.length);
      return filtered;
    });
    
    // Clear stored notifications (this will preserve gig confirmations via backend)
    console.log('🗑️ useNotifications: Calling clearAllStoredNotifications...');
    await clearAllStoredNotifications();
    console.log('🗑️ useNotifications: clearAllStoredNotifications completed');
  }, [clearAllStoredNotifications, userId]);

  // Clear error when connection is restored
  useEffect(() => {
    if (connected) {
      setError(null);
    }
  }, [connected]);

  return {
    notifications: sortedNotifications,
    unreadCount: totalUnreadCount,
    sendNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    isConnected: connected,
    error,
    isLoading,
    refreshNotifications,
  };
};