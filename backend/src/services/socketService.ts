import { Server as SocketIOServer } from 'socket.io';
import { ServerToClientEvents } from '../socket/types.js';
import Notification from '../models/Notification.js';

class SocketService {
  private io: SocketIOServer<{}, ServerToClientEvents> | null = null;

  setIO(io: SocketIOServer<{}, ServerToClientEvents>): void {
    this.io = io;
  }

  // Store notification for offline user in database
  private async storeOfflineNotification(userId: string, notification: any): Promise<void> {
    try {
      const notificationDoc = new Notification({
        id: notification.id,
        from: notification.from,
        to: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        timestamp: new Date(notification.timestamp),
        read: false,
        delivered: false,
      });

      await notificationDoc.save();
      
      console.log(`📬 DEBUG: Stored offline notification in database for user ${userId}:`, {
        userId,
        notificationId: notification.id,
        notificationType: notification.type,
        notificationTitle: notification.title,
        databaseId: notificationDoc._id
      });
    } catch (error) {
      console.error(`❌ ERROR: Failed to store offline notification for user ${userId}:`, error);
    }
  }

  // Get offline notifications for user from database
  async getOfflineNotifications(userId: string): Promise<any[]> {
    try {
      const notifications = await Notification.find({ 
        to: userId, 
        delivered: false 
      }).sort({ timestamp: -1 }).limit(50); // Limit to 50 most recent

      console.log(`📬 DEBUG: Retrieved offline notifications from database for user ${userId}:`, {
        userId,
        notificationsCount: notifications.length,
        notifications: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          timestamp: n.timestamp
        }))
      });

      // Convert to the format expected by the frontend
      const formattedNotifications = notifications.map(notification => ({
        id: notification.id,
        from: notification.from,
        to: notification.to,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        timestamp: notification.timestamp.toISOString(),
        read: notification.read
      }));

      // Mark notifications as delivered AFTER formatting to prevent race conditions
      if (notifications.length > 0) {
        const notificationIds = notifications.map(n => n._id);
        await Notification.updateMany(
          { _id: { $in: notificationIds } },
          { delivered: true }
        );
        console.log(`📬 DEBUG: Marked ${notifications.length} notifications as delivered for user ${userId}`);
      }

      return formattedNotifications;
    } catch (error) {
      console.error(`❌ ERROR: Failed to retrieve offline notifications for user ${userId}:`, error);
      return [];
    }
  }

  // Send notification to a specific user
  async sendNotificationToUser(userId: string, notification: {
    type: 'gig-invitation' | 'gig-confirmation-required' | 'booking-request' | 'status-update' | 'message' | 'system';
    title: string;
    message: string;
    data?: any;
  }): Promise<void> {
    if (!this.io) {
      console.warn('Socket.IO not initialized, cannot send notification');
      return;
    }

    const userRoom = `user:${userId}`;
    const notificationData = {
      id: Date.now().toString(),
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

    // Check if anyone is in the user room
    const roomSize = this.io.sockets.adapter.rooms.get(userRoom)?.size || 0;
    console.log(`🔍 DEBUG: Room ${userRoom} has ${roomSize} connected users`);

    if (roomSize > 0) {
      // User is online, send notification immediately
      this.io.to(userRoom).emit('notification', notificationData);
      console.log(`🔔 Notification sent to user ${userId}: ${notification.title}`);
    } else {
      // User is offline, store notification in database for later delivery
      await this.storeOfflineNotification(userId, notificationData);
      console.log(`📬 Notification stored in database for offline user ${userId}: ${notification.title}`);
    }

    console.log(`🔍 DEBUG: Notification details:`, {
      userRoom,
      userId,
      notificationType: notification.type,
      roomSize,
      notificationData: {
        id: notificationData.id,
        type: notificationData.type,
        title: notificationData.title,
        to: notificationData.to
      }
    });
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
