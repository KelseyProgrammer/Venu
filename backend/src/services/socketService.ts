import { Server as SocketIOServer } from 'socket.io';
import { ServerToClientEvents } from '../socket/types.js';

class SocketService {
  private io: SocketIOServer<{}, ServerToClientEvents> | null = null;

  setIO(io: SocketIOServer<{}, ServerToClientEvents>): void {
    this.io = io;
  }

  // Send notification to a specific user (real-time only)
  sendNotificationToUser(userId: string, notification: {
    type: 'gig-invitation' | 'gig-confirmation-required' | 'booking-request' | 'status-update' | 'message' | 'system';
    title: string;
    message: string;
    data?: any;
  }): void {
    if (!this.io) {
      console.warn('Socket.IO not initialized, cannot send notification');
      return;
    }

    const userRoom = `user:${userId}`;
    const notificationData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: {
        userId: 'system',
        email: 'system@venu.com',
        role: 'system'
      },
      to: userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Check if user is online and send notification
    const roomSize = this.io.sockets.adapter.rooms.get(userRoom)?.size || 0;
    
    if (roomSize > 0) {
      this.io.to(userRoom).emit('notification', notificationData);
      console.log(`🔔 Real-time notification sent to user ${userId}: ${notification.title}`);
    } else {
      console.log(`📱 User ${userId} is offline, notification not delivered`);
    }
  }

  // Send notifications to multiple users (real-time only)
  sendBatchNotifications(notifications: Array<{
    userId: string;
    notification: {
      type: 'gig-invitation' | 'gig-confirmation-required' | 'booking-request' | 'status-update' | 'message' | 'system';
      title: string;
      message: string;
      data?: any;
    };
  }>): void {
    if (!this.io) {
      console.warn('Socket.IO not initialized, cannot send notifications');
      return;
    }

    let deliveredCount = 0;
    let offlineCount = 0;

    // Send notifications to all users
    for (const { userId, notification } of notifications) {
      const userRoom = `user:${userId}`;
      const roomSize = this.io.sockets.adapter.rooms.get(userRoom)?.size || 0;
      
      const notificationData = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        from: {
          userId: 'system',
          email: 'system@venu.com',
          role: 'system'
        },
        to: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        timestamp: new Date().toISOString(),
        read: false
      };

      if (roomSize > 0) {
        this.io.to(userRoom).emit('notification', notificationData);
        deliveredCount++;
      } else {
        offlineCount++;
      }
    }

    console.log(`🔔 Batch notifications: ${deliveredCount} delivered, ${offlineCount} offline`);
  }

  // Send gig update to location room
  sendGigUpdateToLocation(locationId: string, gigUpdate: {
    gigId: string;
    updateType: 'created' | 'updated' | 'cancelled' | 'status-changed';
    gigData: any;
    updatedBy: {
      userId: string;
      email: string;
      role: string;
    };
  }): void {
    if (!this.io) {
      console.warn('Socket.IO not initialized, cannot send gig update');
      return;
    }

    const locationRoom = `location:${locationId}`;
    const updateData = {
      gigId: gigUpdate.gigId,
      locationId,
      updateType: gigUpdate.updateType,
      gigData: gigUpdate.gigData,
      updatedBy: gigUpdate.updatedBy,
      timestamp: new Date().toISOString()
    };

    this.io.to(locationRoom).emit('gig-update', updateData);
    console.log(`🎵 Gig ${gigUpdate.updateType} broadcast to location ${locationId}`);
  }

  // Send artist notification for new gig
  sendArtistGigNotification(artistId: string, gigData: any): void {
    if (!this.io) {
      console.warn('Socket.IO not initialized, cannot send artist notification');
      return;
    }

    const artistRoom = `artist:${artistId}`;
    const notification = {
      id: Date.now().toString(),
      artistId,
      artistName: '', // This would be populated from artist data
      eventId: gigData._id,
      eventTitle: gigData.eventName,
      notificationType: 'new-gig' as const,
      message: `You've been invited to perform at ${gigData.eventName} on ${new Date(gigData.eventDate).toLocaleDateString()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.io.to(artistRoom).emit('artist-notification', notification);
    console.log(`🎵 Artist notification sent to ${artistId} for gig ${gigData._id}`);
  }
}

// Export singleton instance
export const socketService = new SocketService();

