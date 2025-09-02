'use client';

import { useState, useEffect, useCallback } from 'react';
import { SocketMessage } from '@/lib/socket';

interface UseMessagePersistenceProps {
  userId: string;
  locationId?: string;
  enabled?: boolean;
}

interface UseMessagePersistenceReturn {
  offlineMessages: SocketMessage[];
  hasOfflineMessages: boolean;
  clearOfflineMessages: () => void;
  storeOfflineMessage: (message: SocketMessage) => void;
  getStoredMessages: (roomId: string) => SocketMessage[];
  clearStoredMessages: (roomId: string) => void;
}

export const useMessagePersistence = ({
  userId,
  locationId,
  enabled = true
}: UseMessagePersistenceProps): UseMessagePersistenceReturn => {
  const [offlineMessages, setOfflineMessages] = useState<SocketMessage[]>([]);

  // Load offline messages from localStorage on mount
  useEffect(() => {
    if (!enabled || !userId) return;

    const stored = localStorage.getItem(`offline-messages-${userId}`);
    if (stored) {
      try {
        const messages = JSON.parse(stored) as SocketMessage[];
        setOfflineMessages(messages);
      } catch (error) {
        console.error('Failed to parse offline messages:', error);
        localStorage.removeItem(`offline-messages-${userId}`);
      }
    }
  }, [userId, enabled]);

  // Save offline messages to localStorage whenever they change
  useEffect(() => {
    if (!enabled || !userId) return;

    if (offlineMessages.length > 0) {
      localStorage.setItem(`offline-messages-${userId}`, JSON.stringify(offlineMessages));
    } else {
      localStorage.removeItem(`offline-messages-${userId}`);
    }
  }, [offlineMessages, userId, enabled]);

  // Store a message for offline delivery
  const storeOfflineMessage = useCallback((message: SocketMessage) => {
    if (!enabled) return;

    setOfflineMessages(prev => {
      const updated = [...prev, message];
      // Keep only last 50 offline messages to prevent storage bloat
      return updated.slice(-50);
    });
  }, [enabled]);

  // Clear offline messages
  const clearOfflineMessages = useCallback(() => {
    setOfflineMessages([]);
    if (userId) {
      localStorage.removeItem(`offline-messages-${userId}`);
    }
  }, [userId]);

  // Get stored messages for a specific room
  const getStoredMessages = useCallback((roomId: string): SocketMessage[] => {
    if (!enabled || !roomId) return [];

    const stored = localStorage.getItem(`room-messages-${roomId}`);
    if (stored) {
      try {
        return JSON.parse(stored) as SocketMessage[];
      } catch (error) {
        console.error('Failed to parse stored room messages:', error);
        localStorage.removeItem(`room-messages-${roomId}`);
      }
    }
    return [];
  }, [enabled]);

  // Clear stored messages for a specific room
  const clearStoredMessages = useCallback((roomId: string) => {
    if (!enabled || !roomId) return;

    localStorage.removeItem(`room-messages-${roomId}`);
  }, [enabled]);

  // Store message for a specific room
  const storeRoomMessage = useCallback((roomId: string, message: SocketMessage) => {
    if (!enabled || !roomId) return;

    const existing = getStoredMessages(roomId);
    const updated = [...existing, message].slice(-100); // Keep last 100 messages per room
    localStorage.setItem(`room-messages-${roomId}`, JSON.stringify(updated));
  }, [enabled, getStoredMessages]);

  // Auto-clear offline messages when user comes online
  useEffect(() => {
    if (offlineMessages.length > 0) {
      // Check if we're online (this would be connected to your socket connection status)
      const isOnline = navigator.onLine;
      if (isOnline) {
        // Clear offline messages after a short delay to allow for reconnection
        const timer = setTimeout(() => {
          clearOfflineMessages();
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [offlineMessages, clearOfflineMessages]);

  return {
    offlineMessages,
    hasOfflineMessages: offlineMessages.length > 0,
    clearOfflineMessages,
    storeOfflineMessage,
    getStoredMessages,
    clearStoredMessages
  };
};

export default useMessagePersistence;
