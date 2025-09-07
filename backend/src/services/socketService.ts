import { Server as SocketIOServer } from 'socket.io';
import { ServerToClientEvents } from '../socket/types.js';

class SocketService {
  private io: SocketIOServer<{}, ServerToClientEvents> | null = null;

  setIO(io: SocketIOServer<{}, ServerToClientEvents>): void {
    this.io = io;
  }

  // Send notification to a specific user
  sendNotificationToUser(userId: string, notification: {
    type: 'gig-invitation' | 'booking-request' | 'status-update' | 'message' | 'system';
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

    this.io.to(userRoom).emit('notification', notificationData);
    console.log(`🔔 Notification sent to user ${userId}: ${notification.title}`);
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
