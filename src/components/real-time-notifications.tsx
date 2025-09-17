"use client"

import { useCallback, useState, useEffect } from 'react';
import { useWindowManagerContext } from '@/contexts/WindowManagerContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing, X, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { SocketNotification } from '@/lib/socket';

interface RealTimeNotificationsProps {
  className?: string;
  notifications?: SocketNotification[];
  unreadCount: number;
  isConnected: boolean;
  error?: string | null;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

export function RealTimeNotifications({ 
  className = "",
  notifications,
  unreadCount,
  isConnected,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}: RealTimeNotificationsProps) {
  const { openWindow, closeWindow, isWindowOpen, windowRef } = useWindowManagerContext();
  const isOpen = isWindowOpen('notifications');
  const [clearSuccessMessage, setClearSuccessMessage] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  // Debug logging
  console.log('🔔 RealTimeNotifications: Component rendered with:', {
    notificationsCount: notifications?.length || 0,
    unreadCount,
    isConnected,
    error,
    hasMarkAsRead: !!onMarkAsRead,
    hasMarkAllAsRead: !!onMarkAllAsRead,
    isOpen,
    isClearing
  });

  // Listen for notifications cleared event
  useEffect(() => {
    const handleNotificationsCleared = (event: CustomEvent) => {
      const { deletedCount, preservedCount } = event.detail;
      if (deletedCount > 0) {
        setClearSuccessMessage(`✅ Cleared ${deletedCount} notifications${preservedCount > 0 ? ` (${preservedCount} preserved)` : ''}`);
      } else {
        setClearSuccessMessage(`ℹ️ No notifications to clear`);
      }
      setIsClearing(false); // Reset clearing state
      // Clear the message after 3 seconds
      setTimeout(() => setClearSuccessMessage(null), 3000);
    };

    window.addEventListener('notifications-cleared', handleNotificationsCleared as EventListener);
    
    return () => {
      window.removeEventListener('notifications-cleared', handleNotificationsCleared as EventListener);
    };
  }, []);

  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case 'gig-invitation':
        return '🎵';
      case 'gig-confirmation-required':
        return '✅';
      case 'booking-request':
        return '📅';
      case 'status-update':
        return '📊';
      case 'message':
        return '💬';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  }, []);

  const getNotificationColor = useCallback((type: string) => {
    switch (type) {
      case 'gig-invitation':
        return 'bg-purple-950/30 text-purple-300 border-purple-800';
      case 'gig-confirmation-required':
        return 'bg-amber-950/30 text-amber-300 border-amber-800';
      case 'booking-request':
        return 'bg-blue-950/30 text-blue-300 border-blue-800';
      case 'status-update':
        return 'bg-emerald-950/30 text-emerald-300 border-emerald-800';
      case 'message':
        return 'bg-indigo-950/30 text-indigo-300 border-indigo-800';
      case 'system':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  }, []);

  return (
    <div ref={windowRef} className={`relative ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-950/20 border border-red-800 text-red-300 px-2 py-1 rounded-md text-xs mb-2">
          <span className="font-medium">Connection Error</span>
        </div>
      )}
      
      {/* Success Message Display */}
      {clearSuccessMessage && (
        <div className="bg-emerald-950/20 border border-emerald-800 text-emerald-300 px-2 py-1 rounded-md text-xs mb-2">
          <span className="font-medium">{clearSuccessMessage}</span>
        </div>
      )}
      
      {/* Notification Bell */}
      <Button
        variant="default"
        size="sm"
        onClick={() => isOpen ? closeWindow() : openWindow('notifications')}
        className="relative bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-sm"
      >
        {isConnected ? (
          <BellRing className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-semibold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden z-50 shadow-lg border border-border bg-card">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-card-foreground">Notifications</h3>
            <div className="flex items-center gap-1">
              {notifications && notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isClearing}
                  onClick={() => {
                    if (onClearAll && !isClearing) {
                      setIsClearing(true);
                      onClearAll();
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 disabled:opacity-50"
                >
                  {isClearing ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3 mr-1" />
                  )}
                  Clear all
                </Button>
              )}
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isMarkingAllRead}
                  onClick={() => {
                    if (onMarkAllAsRead && !isMarkingAllRead) {
                      setIsMarkingAllRead(true);
                      onMarkAllAsRead();
                      setTimeout(() => setIsMarkingAllRead(false), 1000);
                    }
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-950/20 disabled:opacity-50"
                >
                  {isMarkingAllRead ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3 h-3 mr-1" />
                  )}
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeWindow}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">You'll see updates here when they arrive</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications?.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors duration-150 ${
                      !notification.read ? 'bg-purple-950/20 border-l-2 border-l-purple-500' : ''
                    }`}
                    onClick={() => {
                      console.log('🔔 Notification clicked:', {
                        id: notification.id,
                        read: notification.read,
                        type: notification.type,
                        hasMarkAsRead: !!onMarkAsRead
                      });
                      
                      if (!notification.read && onMarkAsRead) {
                        console.log('🔔 Marking notification as read:', notification.id);
                        onMarkAsRead(notification.id);
                      }
                      
                      // Handle gig confirmation notifications
                      if (notification.type === 'gig-confirmation-required' && notification.data?.gigData) {
                        console.log('🔔 Opening gig confirmation modal');
                        // Dispatch custom event to open confirmation modal
                        window.dispatchEvent(new CustomEvent('open-gig-confirmation', { 
                          detail: { gig: notification.data.gigData } 
                        }));
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm text-card-foreground leading-tight">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-2 py-0.5 ${getNotificationColor(notification.type)}`}
                            >
                              {notification.type.replace('-', ' ')}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                          </span>
                          <span className="truncate max-w-32">
                            from {notification.from.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <span className="font-medium">{notifications?.length || 0} total</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}