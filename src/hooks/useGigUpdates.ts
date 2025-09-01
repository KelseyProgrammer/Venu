import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { SocketGigUpdate } from '@/lib/socket';

interface UseGigUpdatesProps {
  locationId: string;
}

interface UseGigUpdatesReturn {
  gigUpdates: SocketGigUpdate[];
  sendGigUpdate: (gigId: string, updateType: string, gigData: Record<string, unknown>) => void;
  isConnected: boolean;
  error: string | null;
}

export const useGigUpdates = ({ locationId }: UseGigUpdatesProps): UseGigUpdatesReturn => {
  const { connected, autoConnect, joinLocation, leaveLocation, sendGigUpdate: socketSendGigUpdate, onGigUpdate, removeListener } = useSocket();
  const [gigUpdates, setGigUpdates] = useState<SocketGigUpdate[]>([]);
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

  // Listen for gig updates
  useEffect(() => {
    const handleGigUpdate = (update: SocketGigUpdate) => {
      if (update.locationId === locationId) {
        setGigUpdates(prev => [update, ...prev].slice(0, 50)); // Keep last 50 updates
      }
    };

    onGigUpdate(handleGigUpdate);

    return () => {
      removeListener('gig-update', handleGigUpdate as (...args: unknown[]) => void);
    };
  }, [locationId, onGigUpdate, removeListener]);

  // Send gig update function
  const sendGigUpdate = useCallback((gigId: string, updateType: string, gigData: Record<string, unknown>) => {
    if (!connected) {
      setError('Not connected to server');
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

  // Clear error when connection is restored
  useEffect(() => {
    if (connected) {
      setError(null);
    }
  }, [connected]);

  return {
    gigUpdates,
    sendGigUpdate,
    isConnected: connected,
    error
  };
};