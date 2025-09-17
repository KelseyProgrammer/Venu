import { useState, useEffect, useCallback } from 'react';
import { SocketNotification } from '../lib/types';

interface UseStoredNotificationsReturn {
  notifications: SocketNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const useStoredNotifications = (userId?: string): UseStoredNotificationsReturn => {
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stored notifications from the backend
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3001/api/notifications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data.notifications || []);
        console.log(`📬 Loaded ${data.data.notifications?.length || 0} stored notifications for user ${userId}`);
      } else {
        throw new Error(data.error || 'Failed to fetch notifications');
      }
    } catch (err: any) {
      console.error('Error fetching stored notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`http://localhost:3001/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        console.log(`✅ Marked notification ${notificationId} as read`);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        console.log('✅ Marked all notifications as read');
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Clear all notifications (preserving gig notifications awaiting confirmation)
  const clearAllNotifications = useCallback(async () => {
    try {
      console.log('🗑️ Starting to clear all notifications...');
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('❌ No auth token found');
        return;
      }

      console.log('🗑️ Sending DELETE request to clear-all endpoint...');
      const response = await fetch('http://localhost:3001/api/notifications/clear-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🗑️ Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🗑️ Clear all response:', data);
        
        // Refresh notifications to get the updated list (preserved notifications will remain)
        await fetchNotifications();
        
        console.log('✅ Cleared all notifications successfully');
        
        // Show a brief success message with preserved count
        if (typeof window !== 'undefined') {
          // Dispatch a custom event to show success message
          window.dispatchEvent(new CustomEvent('notifications-cleared', { 
            detail: { 
              deletedCount: data.data?.deletedCount || 0,
              preservedCount: data.data?.preservedCount || 0
            } 
          }));
        }
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to clear notifications:', response.status, errorData);
      }
    } catch (err) {
      console.error('❌ Error clearing all notifications:', err);
    }
  }, [fetchNotifications]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Fetch notifications when userId changes (user logs in)
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    refreshNotifications,
  };
};
