"use client"

import { useCallback } from 'react';
import { useGigUpdates } from '@/hooks/useGigUpdates';
import { useWindowManagerContext } from '@/contexts/WindowManagerContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Wifi, WifiOff, X } from 'lucide-react';
import { format } from 'date-fns';
import { SocketGigUpdate } from '@/lib/socket';

interface RealTimeGigUpdatesProps {
  locationId: string;
  className?: string;
}

export function RealTimeGigUpdates({ locationId, className = "" }: RealTimeGigUpdatesProps) {
  const { gigUpdates, isConnected, error } = useGigUpdates({ locationId });
  const { openWindow, closeWindow, isWindowOpen, windowRef } = useWindowManagerContext();
  const isOpen = isWindowOpen('gig-updates');

  const getUpdateIcon = (updateType: string) => {
    switch (updateType) {
      case 'created':
        return '🎵';
      case 'updated':
        return '✏️';
      case 'cancelled':
        return '❌';
      case 'status-changed':
        return '🔄';
      default:
        return '📢';
    }
  };

  const getUpdateColor = (updateType: string) => {
    switch (updateType) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'status-changed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpdateMessage = useCallback((update: SocketGigUpdate) => {
    const { updateType, updatedBy, gigData } = update;
    const gigName = gigData?.name || gigData?.title || 'Gig';
    
    switch (updateType) {
      case 'created':
        return `${updatedBy.email} created a new gig: ${gigName}`;
      case 'updated':
        return `${updatedBy.email} updated gig: ${gigName}`;
      case 'cancelled':
        return `${updatedBy.email} cancelled gig: ${gigName}`;
      case 'status-changed':
        return `${updatedBy.email} changed status for gig: ${gigName}`;
      default:
        return `${updatedBy.email} made changes to gig: ${gigName}`;
    }
  }, []);

  return (
    <div ref={windowRef} className={`relative ${className}`}>
      {/* Gig Updates Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => isOpen ? closeWindow() : openWindow('gig-updates')}
        className="relative bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
      >
        <Music className="w-4 h-4" />
        {gigUpdates.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {gigUpdates.length > 99 ? '99+' : gigUpdates.length}
          </Badge>
        )}
      </Button>

      {/* Gig Updates Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Gig Updates</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeWindow}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Connection Status */}
          <div className="px-4 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? 'Live updates active' : 'Connection lost'}
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-4 py-2 bg-red-50 border-b">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Updates List */}
          <div className="max-h-64 overflow-y-auto">
            {gigUpdates.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No gig updates yet</p>
                <p className="text-xs mt-1">Updates will appear here in real-time</p>
              </div>
            ) : (
              <div className="divide-y">
                {gigUpdates.map((update) => (
                  <div key={update.gigId + update.timestamp} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-lg">
                        {getUpdateIcon(update.updateType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getUpdateColor(update.updateType)}`}
                          >
                            {update.updateType.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">
                          {getUpdateMessage(update)}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(update.timestamp), 'MMM d, HH:mm')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {update.updatedBy.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {isConnected ? '🟢 Live' : '🔴 Offline'}
              </span>
              <span>{gigUpdates.length} updates</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}