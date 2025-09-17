import { Server as SocketIOServer } from 'socket.io';
import { ServerToClientEvents } from '../socket/types.js';
import { getMessaging } from '../config/firebase.config.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

class SocketService {
  private io: SocketIOServer<{}, ServerToClientEvents> | null = null;

  // Getter for io to allow external access
  get ioInstance() {
    return this.io;
  }

  setIO(io: SocketIOServer<{}, ServerToClientEvents>): void {
    this.io = io;
  }

  // Send notification to a specific user (real-time + push notification)
  async sendNotificationToUser(userId: string, notification: {
    type: 'gig-invitation' | 'gig-confirmation-required' | 'gig-created' | 'gig-status-update' | 'booking-request' | 'status-update' | 'message' | 'system';
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

    // Store notification in database first
    await this.storeNotification(notificationData);

    // Check if user is online and send notification
    const roomSize = this.io.sockets.adapter.rooms.get(userRoom)?.size || 0;
    
    if (roomSize > 0) {
      // User is online - send real-time notification
      this.io.to(userRoom).emit('notification', notificationData);
      await this.updateNotificationDelivery(notificationData.id, 'real-time');
      console.log(`🔔 Real-time notification sent to user ${userId}: ${notification.title}`);
    } else {
      // User is offline - send push notification
      const pushResult = await this.sendPushNotification(userId, notificationData);
      if (pushResult.success) {
        await this.updateNotificationDelivery(notificationData.id, 'push', pushResult.messageId);
        console.log(`📱 Push notification sent to offline user ${userId}: ${notification.title}`);
      } else {
        await this.updateNotificationDelivery(notificationData.id, 'failed', undefined, pushResult.error);
        console.log(`❌ Failed to send push notification to user ${userId}: ${pushResult.error}`);
        console.log(`⚠️ User ${userId} is offline and Firebase is not configured. Notification stored in database but not delivered.`);
      }
    }
  }

  // Send push notification via Firebase Cloud Messaging
  private async sendPushNotification(userId: string, notificationData: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const messaging = getMessaging();
      if (!messaging) {
        console.warn('⚠️ Firebase messaging not available, cannot send push notification');
        return { success: false, error: 'Firebase messaging not available' };
      }

      // Get user's FCM token
      const user = await User.findById(userId).select('fcmToken firstName lastName email');
      if (!user || !user.fcmToken) {
        console.log(`📱 User ${userId} has no FCM token, push notification not sent`);
        return { success: false, error: 'No FCM token found for user' };
      }

      // Prepare FCM message
      const message = {
        token: user.fcmToken,
        notification: {
          title: notificationData.title,
          body: notificationData.message,
        },
        data: {
          notificationId: notificationData.id,
          type: notificationData.type,
          userId: userId,
          timestamp: notificationData.timestamp,
          ...(notificationData.data ? { data: JSON.stringify(notificationData.data) } : {}),
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#7c3aed', // Purple color matching VENU theme
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Send the message
      const response = await messaging.send(message);
      console.log(`📱 Push notification sent successfully to user ${userId}: ${response}`);
      return { success: true, messageId: response };
    } catch (error: any) {
      console.error(`❌ Failed to send push notification to user ${userId}:`, error.message);
      
      // Handle specific FCM errors
      if (error.code === 'messaging/registration-token-not-registered') {
        console.log(`🔄 Removing invalid FCM token for user ${userId}`);
        await User.findByIdAndUpdate(userId, { $unset: { fcmToken: 1 } });
      }
      
      return { success: false, error: error.message };
    }
  }

  // Send notifications to multiple users (real-time + push notification)
  async sendBatchNotifications(notifications: Array<{
    userId: string;
    notification: {
      type: 'gig-invitation' | 'gig-confirmation-required' | 'gig-created' | 'gig-status-update' | 'booking-request' | 'status-update' | 'message' | 'system';
      title: string;
      message: string;
      data?: any;
    };
  }>): Promise<void> {
    if (!this.io) {
      console.warn('Socket.IO not initialized, cannot send notifications');
      return;
    }

    let realTimeDeliveredCount = 0;
    let pushDeliveredCount = 0;
    let failedCount = 0;

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

      try {
      if (roomSize > 0) {
          // User is online - send real-time notification
        this.io.to(userRoom).emit('notification', notificationData);
          realTimeDeliveredCount++;
      } else {
          // User is offline - send push notification
          await this.sendPushNotification(userId, notificationData);
          pushDeliveredCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to send notification to user ${userId}:`, error);
        failedCount++;
      }
    }

    console.log(`🔔 Batch notifications: ${realTimeDeliveredCount} real-time, ${pushDeliveredCount} push, ${failedCount} failed`);
  }

  // Send gig update to location room
  async sendGigUpdateToLocation(locationId: string, gigUpdate: {
    gigId: string;
    updateType: 'created' | 'updated' | 'cancelled' | 'status-changed';
    gigData: any;
    updatedBy: {
      userId: string;
      email: string;
      role: string;
    };
  }): Promise<void> {
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

  // Store notification in database
  private async storeNotification(notificationData: any): Promise<void> {
    try {
      const notification = new Notification({
        id: notificationData.id,
        from: notificationData.from,
        to: notificationData.to,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        timestamp: notificationData.timestamp,
        read: false,
        delivered: false,
        deliveryMethod: 'failed',
        retryCount: 0,
      });

      await notification.save();
      console.log(`💾 Notification stored in database: ${notificationData.id}`);
    } catch (error: any) {
      console.error(`❌ Error storing notification in database:`, error.message);
    }
  }

  // Update notification delivery status
  private async updateNotificationDelivery(
    notificationId: string, 
    deliveryMethod: 'real-time' | 'push' | 'both' | 'failed',
    fcmMessageId?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        delivered: deliveryMethod !== 'failed',
        deliveryMethod,
      };

      if (fcmMessageId) {
        updateData.fcmMessageId = fcmMessageId;
      }

      if (errorMessage) {
        updateData.errorMessage = errorMessage;
        updateData.retryCount = { $inc: 1 };
      }

      await Notification.updateOne({ id: notificationId }, { $set: updateData });
      console.log(`📊 Updated notification delivery status: ${notificationId} - ${deliveryMethod}`);
    } catch (error: any) {
      console.error(`❌ Error updating notification delivery status:`, error.message);
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();

