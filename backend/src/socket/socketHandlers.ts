import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken, JWTPayload } from '../config/jwt.config.js';
import { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  SocketAuth,
  SocketMessage,
  SocketGigUpdate,
  SocketNotification
} from './types.js';

// Extend Socket interface to include user data
interface AuthenticatedSocket extends Socket {
  user?: JWTPayload;
}

// Rate limiting class
class RateLimiter {
  private userLimits: Map<string, { count: number; resetTime: number }> = new Map();
  private maxMessagesPerMinute = 30;
  private windowMs = 60000; // 1 minute

  canSendMessage(userId: string): boolean {
    const now = Date.now();
    const limit = this.userLimits.get(userId);

    if (!limit || now > limit.resetTime) {
      this.userLimits.set(userId, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (limit.count >= this.maxMessagesPerMinute) {
      return false;
    }

    limit.count++;
    return true;
  }

  resetLimit(userId: string): void {
    this.userLimits.delete(userId);
  }
}

// Enhanced Message Batching System
class MessageBatcher {
  private messageQueue: Map<string, { messages: any[]; timeoutId: NodeJS.Timeout | null }> = new Map();
  private batchTimeout = 100; // ms
  private maxBatchSize = 10; // Maximum messages per batch
  private onBatchReady?: (roomId: string, messages: any[], io: SocketIOServer) => void;

  constructor(onBatchReady?: (roomId: string, messages: any[], io: SocketIOServer) => void) {
    this.onBatchReady = onBatchReady || (() => {});
  }

  addMessage(roomId: string, message: any): void {
    const batch = this.messageQueue.get(roomId);
    
    if (batch) {
      batch.messages.push(message);
      
      // Send immediately if batch is full
      if (batch.messages.length >= this.maxBatchSize) {
        this.sendBatch(roomId);
        return;
      }
      
      if (batch.timeoutId) {
        clearTimeout(batch.timeoutId);
      }
    } else {
      this.messageQueue.set(roomId, { messages: [message], timeoutId: null });
    }

    // Schedule batch send
    const timeoutId = setTimeout(() => this.sendBatch(roomId), this.batchTimeout);
    this.messageQueue.get(roomId)!.timeoutId = timeoutId;
  }

  private sendBatch(roomId: string): void {
    const batch = this.messageQueue.get(roomId);
    if (batch && batch.messages.length > 0) {
      // Call the batch ready callback if provided
      if (this.onBatchReady) {
        this.onBatchReady(roomId, [...batch.messages], this.io);
      }
      this.messageQueue.delete(roomId);
    }
  }

  clearBatch(roomId: string): void {
    const batch = this.messageQueue.get(roomId);
    if (batch && batch.timeoutId) {
      clearTimeout(batch.timeoutId);
    }
    this.messageQueue.delete(roomId);
  }

  getBatchSize(roomId: string): number {
    const batch = this.messageQueue.get(roomId);
    return batch ? batch.messages.length : 0;
  }

  flushAllBatches(): void {
    for (const roomId of this.messageQueue.keys()) {
      this.sendBatch(roomId);
    }
  }

  private io!: SocketIOServer;
  setIO(io: SocketIOServer): void {
    this.io = io;
  }
}

// Enhanced Room Management
class RoomManager {
  private activeRooms: Map<string, RoomState> = new Map();
  private connectedUsers: Map<string, Set<string>> = new Map();

  async joinRoom(userId: string, roomId: string, userRole: string): Promise<void> {
    const room = this.activeRooms.get(roomId) || this.createRoom(roomId);
    room.addUser(userId, userRole);
    
    // Track connected users
    if (!this.connectedUsers.has(roomId)) {
      this.connectedUsers.set(roomId, new Set());
    }
    this.connectedUsers.get(roomId)!.add(userId);
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    const room = this.activeRooms.get(roomId);
    if (room) {
      room.removeUser(userId);
      if (room.getUserCount() === 0) {
        this.activeRooms.delete(roomId);
      }
    }

    // Remove from connected users
    const users = this.connectedUsers.get(roomId);
    if (users) {
      users.delete(userId);
      if (users.size === 0) {
        this.connectedUsers.delete(roomId);
      }
    }
  }

  getRelevantUsers(roomId: string, userRole: string): string[] {
    const room = this.activeRooms.get(roomId);
    if (!room) return [];
    
    // Location owners see all messages
    if (userRole === 'location-owner') {
      return room.getAllUsers();
    }
    
    // Artists only see messages from their bookings
    if (userRole === 'artist') {
      return room.getUsersByRole(['location-owner', 'promoter']);
    }
    
    // Promoters see location-specific messages
    if (userRole === 'promoter') {
      return room.getUsersByRole(['location-owner', 'artist']);
    }
    
    return [];
  }

  getConnectedUsers(roomId: string): string[] {
    const users = this.connectedUsers.get(roomId);
    return users ? Array.from(users) : [];
  }

  private createRoom(roomId: string): RoomState {
    const room = new RoomState(roomId);
    this.activeRooms.set(roomId, room);
    return room;
  }
}

// Room State Management
class RoomState {
  private users: Map<string, string> = new Map(); // userId -> role
  private messages: CircularBuffer<SocketMessage> = new CircularBuffer(100);

  constructor(private roomId: string) {}

  addUser(userId: string, role: string): void {
    this.users.set(userId, role);
  }

  removeUser(userId: string): void {
    this.users.delete(userId);
  }

  getUserCount(): number {
    return this.users.size;
  }

  getAllUsers(): string[] {
    return Array.from(this.users.keys());
  }

  getUsersByRole(roles: string[]): string[] {
    return Array.from(this.users.entries())
      .filter(([_, role]) => roles.includes(role))
      .map(([userId, _]) => userId);
  }

  addMessage(message: SocketMessage): void {
    this.messages.add(message);
  }

  getMessages(): SocketMessage[] {
    return this.messages.getAll();
  }
}

// Circular Buffer for Efficient Memory Usage
class CircularBuffer<T> {
  private buffer: T[] = [];
  private maxSize: number;
  private currentIndex = 0;
  
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  
  add(item: T): void {
    if (this.buffer.length < this.maxSize) {
      this.buffer.push(item);
    } else {
      this.buffer[this.currentIndex] = item;
      this.currentIndex = (this.currentIndex + 1) % this.maxSize;
    }
  }

  getAll(): T[] {
    return [...this.buffer];
  }
}

// Socket authentication middleware
const authenticateSocket = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const auth = socket.handshake.auth as SocketAuth;
    const token = auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    console.log('🔐 Socket authentication attempt:', {
      hasAuth: !!auth,
      hasToken: !!token,
      tokenLength: token?.length,
      headers: Object.keys(socket.handshake.headers)
    });
    
    if (!token) {
      console.log('❌ No authentication token provided');
      // For development, allow connection without token but mark as unauthenticated
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Development mode: allowing unauthenticated connection');
        socket.user = {
          userId: 'anonymous',
          email: 'anonymous@example.com',
          role: 'anonymous'
        };
        return next();
      }
      return next(new Error('Authentication token required'));
    }

    const decoded = verifyToken(token);
    
    // Validate JWT payload structure
    if (!decoded.userId || !decoded.email || !decoded.role) {
      console.log('❌ Invalid token payload:', decoded);
      return next(new Error('Invalid token payload'));
    }
    
    socket.user = decoded;
    console.log('✅ Socket authenticated successfully for:', socket.user.email);
    next();
  } catch (error) {
    console.error('❌ Socket authentication failed:', error);
    // For development, allow connection with anonymous user
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Development mode: allowing connection with anonymous user due to auth error');
      socket.user = {
        userId: 'anonymous',
        email: 'anonymous@example.com',
        role: 'anonymous'
      };
      return next();
    }
    next(new Error('Invalid or expired token'));
  }
};

// Memory-Efficient Message Storage
class MessageStore {
  private messages: Map<string, CircularBuffer<SocketMessage>> = new Map();
  private maxMessagesPerRoom = 100;
  private offlineQueue: Map<string, SocketMessage[]> = new Map();

  addMessage(roomId: string, message: SocketMessage): void {
    const buffer = this.messages.get(roomId) || new CircularBuffer(this.maxMessagesPerRoom);
    buffer.add(message);
    this.messages.set(roomId, buffer);
  }

  getMessages(roomId: string): SocketMessage[] {
    const buffer = this.messages.get(roomId);
    return buffer ? buffer.getAll() : [];
  }

  addOfflineMessage(userId: string, message: SocketMessage): void {
    if (!this.offlineQueue.has(userId)) {
      this.offlineQueue.set(userId, []);
    }
    this.offlineQueue.get(userId)!.push(message);
  }

  getOfflineMessages(userId: string): SocketMessage[] {
    const messages = this.offlineQueue.get(userId) || [];
    this.offlineQueue.delete(userId); // Clear after retrieval
    return messages;
  }

  clearRoomMessages(roomId: string): void {
    this.messages.delete(roomId);
  }
}

// Real-time Analytics
class SocketAnalytics {
  private metrics = {
    activeConnections: 0,
    messagesPerSecond: 0,
    averageLatency: 0,
    errorRate: 0,
    totalMessages: 0,
    startTime: Date.now()
  };

  private messageTimestamps: number[] = [];
  private latencyMeasurements: number[] = [];
  private errorCount = 0;

  trackConnection(): void {
    this.metrics.activeConnections++;
  }

  trackDisconnection(): void {
    this.metrics.activeConnections = Math.max(0, this.metrics.activeConnections - 1);
  }

  trackMessage(latency?: number): void {
    this.metrics.totalMessages++;
    this.messageTimestamps.push(Date.now());
    
    if (latency !== undefined) {
      this.latencyMeasurements.push(latency);
      this.metrics.averageLatency = 
        this.latencyMeasurements.reduce((a, b) => a + b, 0) / this.latencyMeasurements.length;
    }

    // Keep only last 1000 timestamps for rate calculation
    if (this.messageTimestamps.length > 1000) {
      this.messageTimestamps = this.messageTimestamps.slice(-1000);
    }
  }

  trackError(): void {
    this.errorCount++;
    this.metrics.errorRate = this.errorCount / this.metrics.totalMessages;
  }

  getMetrics() {
    // Calculate messages per second over last minute
    const oneMinuteAgo = Date.now() - 60000;
    const recentMessages = this.messageTimestamps.filter(ts => ts > oneMinuteAgo);
    this.metrics.messagesPerSecond = recentMessages.length;

    return { ...this.metrics };
  }
}

// Socket event handlers
export const setupOptimizedSocketHandlers = (io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) => {
  const roomManager = new RoomManager();
  const messageStore = new MessageStore();
  const analytics = new SocketAnalytics();
  const rateLimiter = new RateLimiter();
  
  // Initialize message batcher with callback
  const messageBatcher = new MessageBatcher((roomId: string, messages: any[], io: SocketIOServer) => {
    // Broadcast batched messages efficiently
    const locationRoom = `location:${roomId}`;
    io.to(locationRoom).emit('batch-messages', { roomId, messages });
    analytics.trackMessage();
  });
  
  messageBatcher.setIO(io);

  // Apply authentication middleware
  io.use(authenticateSocket);

  // Apply rate limiting middleware
  io.use((socket: AuthenticatedSocket, next) => {
    if (!socket.user) {
      console.log('❌ No user found in socket, rejecting connection');
      return next(new Error('Authentication required'));
    }

    // Allow anonymous users in development
    if (socket.user.role === 'anonymous' && process.env.NODE_ENV === 'development') {
      console.log('⚠️ Development mode: allowing anonymous user to connect');
      return next();
    }

    // Rate limiting for message events
    socket.use(([event, data], next) => {
      if (event === 'send-message' && !rateLimiter.canSendMessage(socket.user!.userId)) {
        return next(new Error('Rate limit exceeded'));
      }
      next();
    });

    next();
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User ${socket.user?.email} connected with socket ID: ${socket.id}`);
    
    // Track connection in analytics
    analytics.trackConnection();

    // Join user-specific room for notifications
    if (socket.user) {
      const userRoom = `user:${socket.user.userId}`;
      socket.join(userRoom);
      console.log(`📱 User ${socket.user.email} joined room: ${userRoom}`);
      
      // Send any offline messages
      const offlineMessages = messageStore.getOfflineMessages(socket.user.userId);
      if (offlineMessages.length > 0) {
        socket.emit('offline-messages', { messages: offlineMessages });
        console.log(`📬 Sent ${offlineMessages.length} offline messages to ${socket.user.email}`);
      }
    }

    // Handle joining location-specific rooms
    socket.on('join-location', async (locationId: string) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      try {
        await roomManager.joinRoom(socket.user.userId, locationId, socket.user.role);
        const locationRoom = `location:${locationId}`;
        socket.join(locationRoom);
        console.log(`🏢 User ${socket.user.email} joined location room: ${locationRoom}`);
        
        socket.emit('joined-location', { locationId, message: 'Successfully joined location room' });
      } catch (error) {
        console.error('Error joining location room:', error);
        socket.emit('error', { message: 'Failed to join location room' });
      }
    });

    // Handle joining event-specific rooms (for fans)
    socket.on('join-event', async (eventId: string) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      try {
        const eventRoom = `event:${eventId}`;
        socket.join(eventRoom);
        console.log(`🎫 User ${socket.user.email} joined event room: ${eventRoom}`);
        
        socket.emit('joined-event', { eventId, message: 'Successfully joined event room' });
      } catch (error) {
        console.error('Error joining event room:', error);
        socket.emit('error', { message: 'Failed to join event room' });
      }
    });

    // Handle joining artist-specific rooms (for fans)
    socket.on('join-artist', async (artistId: string) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      try {
        const artistRoom = `artist:${artistId}`;
        socket.join(artistRoom);
        console.log(`🎵 User ${socket.user.email} joined artist room: ${artistRoom}`);
        
        socket.emit('joined-artist', { artistId, message: 'Successfully joined artist room' });
      } catch (error) {
        console.error('Error joining artist room:', error);
        socket.emit('error', { message: 'Failed to join artist room' });
      }
    });

    // Handle leaving location-specific rooms
    socket.on('leave-location', async (locationId: string) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      try {
        await roomManager.leaveRoom(socket.user.userId, locationId);
        const locationRoom = `location:${locationId}`;
        socket.leave(locationRoom);
        console.log(`🏢 User ${socket.user.email} left location room: ${locationRoom}`);
        
        socket.emit('left-location', { locationId, message: 'Successfully left location room' });
      } catch (error) {
        console.error('Error leaving location room:', error);
        socket.emit('error', { message: 'Failed to leave location room' });
      }
    });

    // Handle leaving event-specific rooms (for fans)
    socket.on('leave-event', async (eventId: string) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      try {
        const eventRoom = `event:${eventId}`;
        socket.leave(eventRoom);
        console.log(`🎫 User ${socket.user.email} left event room: ${eventRoom}`);
        
        socket.emit('left-event', { eventId, message: 'Successfully left event room' });
      } catch (error) {
        console.error('Error leaving event room:', error);
        socket.emit('error', { message: 'Failed to leave event room' });
      }
    });

    // Handle leaving artist-specific rooms (for fans)
    socket.on('leave-artist', async (artistId: string) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      try {
        const artistRoom = `artist:${artistId}`;
        socket.leave(artistRoom);
        console.log(`🎵 User ${socket.user.email} left artist room: ${artistRoom}`);
        
        socket.emit('left-artist', { artistId, message: 'Successfully left artist room' });
      } catch (error) {
        console.error('Error leaving artist room:', error);
        socket.emit('error', { message: 'Failed to leave artist room' });
      }
    });

    // Handle chat messages with batching
    socket.on('send-message', async (data: { locationId: string; message: string; type?: 'text' | 'system' }) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      const { locationId, message, type = 'text' } = data;
      
      if (!message.trim()) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }

      const messageData: SocketMessage = {
        id: Date.now().toString(),
        userId: socket.user.userId,
        userEmail: socket.user.email,
        userRole: socket.user.role,
        locationId,
        message: message.trim(),
        type,
        timestamp: new Date().toISOString()
      };

      // Store message in room state
      const room = roomManager['activeRooms'].get(locationId);
      if (room) {
        room.addMessage(messageData);
      }

      // Store message for persistence
      messageStore.addMessage(locationId, messageData);

      // Batch message for efficient broadcasting
      messageBatcher.addMessage(locationId, messageData);

      // Get relevant users for targeted broadcasting
      const relevantUsers = roomManager.getRelevantUsers(locationId, socket.user.role);
      
      // Broadcast to relevant users only
      const locationRoom = `location:${locationId}`;
      io.to(locationRoom).emit('new-message', messageData);
      
      // Track message in analytics
      analytics.trackMessage();
      
      console.log(`💬 Message from ${socket.user.email} in location ${locationId}: ${message}`);
    });

    // Handle gig updates with targeted broadcasting
    socket.on('gig-updated', async (data: { gigId: string; locationId: string; updateType: 'created' | 'updated' | 'cancelled' | 'status-changed'; gigData: any }) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      const { gigId, locationId, updateType, gigData } = data;
      
      const updateData: SocketGigUpdate = {
        gigId,
        locationId,
        updateType,
        gigData,
        updatedBy: {
          userId: socket.user.userId,
          email: socket.user.email,
          role: socket.user.role
        },
        timestamp: new Date().toISOString()
      };

      // Get relevant users for this update
      const relevantUsers = roomManager.getRelevantUsers(locationId, socket.user.role);
      
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
      
      const notification: SocketNotification = {
        id: Date.now().toString(),
        from: {
          userId: socket.user.userId,
          email: socket.user.email,
          role: socket.user.role
        },
        to: targetUserId,
        type,
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
    socket.on('disconnect', async (reason) => {
      console.log(`❌ User ${socket.user?.email} disconnected: ${reason}`);
      
      // Track disconnection in analytics
      analytics.trackDisconnection();
      
      if (socket.user) {
        // Remove user from all location rooms they were in
        const connectedUsers = roomManager['connectedUsers'];
        for (const [locationId, users] of connectedUsers) {
          users.delete(socket.user!.userId);
          if (users.size === 0) {
            connectedUsers.delete(locationId);
          }
        }

        // Reset rate limit for user
        rateLimiter.resetLimit(socket.user.userId);
        
        // Clear any pending batches for this user
        messageBatcher.clearBatch(socket.user.userId);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.user?.email}:`, error);
      analytics.trackError();
    });
  });

  // Add admin endpoint for analytics
  io.on('admin-analytics', (callback) => {
    if (typeof callback === 'function') {
      callback(analytics.getMetrics());
    }
  });

  // Periodic analytics logging
  setInterval(() => {
    const metrics = analytics.getMetrics();
    console.log('📊 Socket.IO Analytics:', {
      activeConnections: metrics.activeConnections,
      messagesPerSecond: metrics.messagesPerSecond,
      totalMessages: metrics.totalMessages,
      errorRate: `${(metrics.errorRate * 100).toFixed(2)}%`,
      uptime: `${Math.round((Date.now() - metrics.startTime) / 1000)}s`
    });
  }, 60000); // Log every minute

  console.log('🔌 Optimized Socket.IO handlers configured successfully');
};

// Legacy setupSocketHandlers for backward compatibility
export const setupSocketHandlers = setupOptimizedSocketHandlers;

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
  // This would need to be updated to work with the new RoomManager
  return [];
};

// Fan-specific utility functions
export const emitTicketUpdate = (io: SocketIOServer, eventId: string, update: { ticketsRemaining: number; totalTickets: number; soldOut: boolean }) => {
  const eventRoom = `event:${eventId}`;
  const ticketUpdate = {
    eventId,
    ...update,
    timestamp: new Date().toISOString()
  };
  io.to(eventRoom).emit('ticket-update', ticketUpdate);
  console.log(`🎫 Ticket update for event ${eventId}: ${update.ticketsRemaining}/${update.totalTickets} remaining`);
};

export const emitPriceUpdate = (io: SocketIOServer, eventId: string, update: { oldPrice: number; newPrice: number; changeType: 'increase' | 'decrease' | 'dynamic' }) => {
  const eventRoom = `event:${eventId}`;
  const priceUpdate = {
    eventId,
    ...update,
    timestamp: new Date().toISOString()
  };
  io.to(eventRoom).emit('price-update', priceUpdate);
  console.log(`💰 Price update for event ${eventId}: $${update.oldPrice} → $${update.newPrice} (${update.changeType})`);
};

export const emitEventStatusUpdate = (io: SocketIOServer, eventId: string, update: { oldStatus: string; newStatus: string; statusType: 'cancelled' | 'rescheduled' | 'venue-changed' | 'time-changed'; details?: string }) => {
  const eventRoom = `event:${eventId}`;
  const statusUpdate = {
    eventId,
    ...update,
    timestamp: new Date().toISOString()
  };
  io.to(eventRoom).emit('event-status-update', statusUpdate);
  console.log(`📅 Event status update for event ${eventId}: ${update.oldStatus} → ${update.newStatus} (${update.statusType})`);
};

export const emitArtistNotification = (io: SocketIOServer, artistId: string, notification: { eventId: string; eventTitle: string; notificationType: 'new-gig' | 'gig-cancelled' | 'gig-rescheduled' | 'price-drop'; message: string }) => {
  const artistRoom = `artist:${artistId}`;
  const artistNotification = {
    id: Date.now().toString(),
    artistId,
    artistName: '', // This would be populated from the artist data
    ...notification,
    timestamp: new Date().toISOString(),
    read: false
  };
  io.to(artistRoom).emit('artist-notification', artistNotification);
  console.log(`🎵 Artist notification for ${artistId}: ${notification.notificationType} - ${notification.message}`);
};
