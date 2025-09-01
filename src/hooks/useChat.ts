import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { SocketMessage, SocketTypingIndicator } from '@/lib/socket';

interface UseChatProps {
  locationId: string;
  currentUserId?: string;
}

interface UseChatReturn {
  messages: SocketMessage[];
  sendMessage: (message: string) => void;
  isConnected: boolean;
  typingUsers: string[];
  error: string | null;
}

export const useChat = ({ locationId, currentUserId }: UseChatProps): UseChatReturn => {
  const { connected, autoConnect, joinLocation, leaveLocation, sendMessage: socketSendMessage, onNewMessage, onUserTyping, removeListener } = useSocket();
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

  // Join location room when component mounts or locationId changes
  useEffect(() => {
    if (connected && locationId) {
      joinLocation(locationId);
    }

    return () => {
      if (locationId) {
        leaveLocation(locationId);
      }
    };
  }, [connected, locationId, joinLocation, leaveLocation]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: SocketMessage) => {
      if (message.locationId === locationId) {
        setMessages(prev => [...prev, message]);
      }
    };

    onNewMessage(handleNewMessage);

    return () => {
      removeListener('new-message', handleNewMessage as (...args: unknown[]) => void);
    };
  }, [locationId, onNewMessage, removeListener]);

  // Listen for typing indicators
  useEffect(() => {
    const handleUserTyping = (data: SocketTypingIndicator) => {
      if (data.locationId === locationId && data.userId !== currentUserId && currentUserId) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return prev.includes(data.userEmail) ? prev : [...prev, data.userEmail];
          } else {
            return prev.filter(user => user !== data.userEmail);
          }
        });
      }
    };

    onUserTyping(handleUserTyping);

    return () => {
      removeListener('user-typing', handleUserTyping as (...args: unknown[]) => void);
    };
  }, [locationId, currentUserId, onUserTyping, removeListener]);

  // Send message function
  const sendMessage = useCallback((message: string) => {
    if (!connected || !message.trim()) {
      return;
    }

    try {
      socketSendMessage(locationId, message.trim());
      setError(null);
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
    messages,
    sendMessage,
    isConnected: connected,
    typingUsers,
    error
  };
};