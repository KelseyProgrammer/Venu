import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { SocketNotification } from '@/lib/socket';

interface UseNotificationsReturn {
  notifications: SocketNotification[];
  unreadCount: number;
  sendNotification: (targetUserId: string, type: string, title: string, message: string, data?: Record<string, unknown>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  isConnected: boolean;
  error: string | null;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { socket, connected, autoConnect, sendNotification: socketSendNotification, onNotification, removeListener } = useSocket();
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
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
      setNotifications(prev => [notification, ...prev].slice(0, 100)); // Keep last 100 notifications
    };

    onNotification(handleNotification);

    return () => {
      removeListener('notification', handleNotification as (...args: unknown[]) => void);
    };
  }, [onNotification, removeListener]);

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

  // Clear error when connection is restored
  useEffect(() => {
    if (connected) {
      setError(null);
    }
  }, [connected]);

  return {
    notifications,
    unreadCount,
    sendNotification,
    markAsRead,
    markAllAsRead,
    isConnected: connected,
    error
  };
};