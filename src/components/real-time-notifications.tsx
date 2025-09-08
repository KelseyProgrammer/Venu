"use client"

import { useCallback } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useWindowManagerContext } from '@/contexts/WindowManagerContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing, X, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';

interface RealTimeNotificationsProps {
  className?: string;
}

export function RealTimeNotifications({ className = "" }: RealTimeNotificationsProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected, error } = useNotifications();
  const { openWindow, closeWindow, isWindowOpen, windowRef } = useWindowManagerContext();
  const isOpen = isWindowOpen('notifications');

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
        return 'bg-purple-100 text-purple-800';
      case 'gig-confirmation-required':
        return 'bg-orange-100 text-orange-800';
      case 'booking-request':
        return 'bg-blue-100 text-blue-800';
      case 'status-update':
        return 'bg-green-100 text-green-800';
      case 'message':
        return 'bg-orange-100 text-orange-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  return (
    <div ref={windowRef} className={`relative ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-2 py-1 rounded-md text-xs mb-2">
          <span className="font-medium">Connection Error</span>
        </div>
      )}
      
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => isOpen ? closeWindow() : openWindow('notifications')}
        className="relative bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
      >
        {isConnected ? (
          <BellRing className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={closeWindow}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      
                      // Handle gig confirmation notifications
                      if (notification.type === 'gig-confirmation-required' && notification.data?.gigData) {
                        // Dispatch custom event to open confirmation modal
                        window.dispatchEvent(new CustomEvent('open-gig-confirmation', { 
                          detail: { gig: notification.data.gigData } 
                        }));
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getNotificationColor(notification.type)}`}
                          >
                            {notification.type.replace('-', ' ')}
                          </Badge>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            from {notification.from.email}
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
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </span>
              <span>{notifications.length} total</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}