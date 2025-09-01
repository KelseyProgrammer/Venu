import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken, JWTPayload } from '../config/jwt.config.js';
import { ApiResponse } from '../shared/types.js';
import { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  SocketAuth,
  SocketMessage,
  SocketGigUpdate,
  SocketNotification,
  SocketTypingIndicator,
  SocketUserPresence
} from './types.js';

// Extend Socket interface to include user data
interface AuthenticatedSocket extends Socket {
  user?: JWTPayload;
}

// Socket authentication middleware
const authenticateSocket = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const auth = socket.handshake.auth as SocketAuth;
    const token = auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = verifyToken(token);
    
    // Validate JWT payload structure
    if (!decoded.userId || !decoded.email || !decoded.role) {
      return next(new Error('Invalid token payload'));
    }
    
    socket.user = decoded;
    next();
  } catch (error) {
    console.error('Socket authentication failed:', error);
    next(new Error('Invalid or expired token'));
  }
};

// Store connected users by room
const connectedUsers = new Map<string, Set<string>>();

// Socket event handlers
export const setupSocketHandlers = (io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User ${socket.user?.email} connected with socket ID: ${socket.id}`);

    // Join user-specific room for notifications
    if (socket.user) {
      const userRoom = `user:${socket.user.userId}`;
      socket.join(userRoom);
      console.log(`📱 User ${socket.user.email} joined room: ${userRoom}`);
    }

    // Handle joining location-specific rooms
    socket.on('join-location', (locationId: string) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      const locationRoom = `location:${locationId}`;
      socket.join(locationRoom);
      console.log(`🏢 User ${socket.user.email} joined location room: ${locationRoom}`);
      
      // Track connected users for this location
      if (!connectedUsers.has(locationId)) {
        connectedUsers.set(locationId, new Set());
      }
      connectedUsers.get(locationId)!.add(socket.user.userId);
      
      socket.emit('joined-location', { locationId, message: 'Successfully joined location room' });
    });

    // Handle leaving location-specific rooms
    socket.on('leave-location', (locationId: string) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      const locationRoom = `location:${locationId}`;
      socket.leave(locationRoom);
      console.log(`🏢 User ${socket.user.email} left location room: ${locationRoom}`);
      
      // Remove user from connected users tracking
      const users = connectedUsers.get(locationId);
      if (users) {
        users.delete(socket.user.userId);
        if (users.size === 0) {
          connectedUsers.delete(locationId);
        }
      }
      
      socket.emit('left-location', { locationId, message: 'Successfully left location room' });
    });

    // Handle chat messages
    socket.on('send-message', (data: { locationId: string; message: string; type?: 'text' | 'system' }) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      const { locationId, message, type = 'text' } = data;
      
      if (!message.trim()) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      const messageData = {
        id: Date.now().toString(),
        userId: socket.user.userId,
        userEmail: socket.user.email,
        userRole: socket.user.role,
        locationId,
        message: message.trim(),
        type,
        timestamp: new Date().toISOString()
      };

      // Broadcast message to all users in the location room
      const locationRoom = `location:${locationId}`;
      io.to(locationRoom).emit('new-message', messageData);
      
      console.log(`💬 Message from ${socket.user.email} in location ${locationId}: ${message}`);
    });

    // Handle gig updates
    socket.on('gig-updated', (data: { gigId: string; locationId: string; updateType: 'created' | 'updated' | 'cancelled' | 'status-changed'; gigData: any }) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      const { gigId, locationId, updateType, gigData } = data;
      
      const updateData = {
        gigId,
        locationId,
        updateType, // 'created', 'updated', 'cancelled', 'status-changed'
        gigData,
        updatedBy: {
          userId: socket.user.userId,
          email: socket.user.email,
          role: socket.user.role
        },
        timestamp: new Date().toISOString()
      };

      // Broadcast to location room
      const locationRoom = `location:${locationId}`;
      io.to(locationRoom).emit('gig-update', updateData);
      
      // Also notify the gig creator if they're not in the location room
      const gigCreatorRoom = `user:${gigData.createdBy}`;
      if (gigData.createdBy !== socket.user.userId) {
        io.to(gigCreatorRoom).emit('gig-update', updateData);
      }
      
      console.log(`🎵 Gig ${updateType} by ${socket.user.email} in location ${locationId}`);
    });

    // Handle notifications
    socket.on('send-notification', (data: { targetUserId: string; type: 'gig-invitation' | 'booking-request' | 'status-update' | 'message' | 'system'; title: string; message: string; data?: any }) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      const { targetUserId, type, title, message, data: notificationData } = data;
      
      const notification = {
        id: Date.now().toString(),
        from: {
          userId: socket.user.userId,
          email: socket.user.email,
          role: socket.user.role
        },
        to: targetUserId,
        type, // 'gig-invitation', 'booking-request', 'status-update', 'message'
        title,
        message,
        data: notificationData,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Send to specific user
      const userRoom = `user:${targetUserId}`;
      io.to(userRoom).emit('notification', notification);
      
      console.log(`🔔 Notification sent from ${socket.user.email} to user ${targetUserId}: ${title}`);
    });

    // Handle typing indicators
    socket.on('typing-start', (data: { locationId: string }) => {
      if (!socket.user) return;
      
      const { locationId } = data;
      const locationRoom = `location:${locationId}`;
      
      socket.to(locationRoom).emit('user-typing', {
        userId: socket.user.userId,
        userEmail: socket.user.email,
        locationId,
        isTyping: true
      });
    });

    socket.on('typing-stop', (data: { locationId: string }) => {
      if (!socket.user) return;
      
      const { locationId } = data;
      const locationRoom = `location:${locationId}`;
      
      socket.to(locationRoom).emit('user-typing', {
        userId: socket.user.userId,
        userEmail: socket.user.email,
        locationId,
        isTyping: false
      });
    });

    // Handle user presence
    socket.on('update-presence', (data: { locationId: string; status: 'online' | 'away' | 'busy' }) => {
      if (!socket.user) return;
      
      const { locationId, status } = data;
      const locationRoom = `location:${locationId}`;
      
      socket.to(locationRoom).emit('user-presence', {
        userId: socket.user.userId,
        userEmail: socket.user.email,
        locationId,
        status,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ User ${socket.user?.email} disconnected: ${reason}`);
      
      if (socket.user) {
        // Remove user from all location rooms they were in
        connectedUsers.forEach((users, locationId) => {
          users.delete(socket.user!.userId);
          if (users.size === 0) {
            connectedUsers.delete(locationId);
          }
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user?.email}:`, error);
    });
  });

  console.log('🔌 Socket.IO handlers configured successfully');
};

// Utility function to emit events to specific users
export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any) => {
  const userRoom = `user:${userId}`;
  io.to(userRoom).emit(event, data);
};

// Utility function to emit events to location rooms
export const emitToLocation = (io: SocketIOServer, locationId: string, event: string, data: any) => {
  const locationRoom = `location:${locationId}`;
  io.to(locationRoom).emit(event, data);
};

// Utility function to get connected users for a location
export const getConnectedUsers = (locationId: string): string[] => {
  const users = connectedUsers.get(locationId);
  return users ? Array.from(users) : [];
};
