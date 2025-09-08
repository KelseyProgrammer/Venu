import { io, Socket } from 'socket.io-client';

// Socket.IO event types for frontend
export interface SocketMessage {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  locationId: string;
  message: string;
  type: 'text' | 'system';
  timestamp: string;
}

export interface SocketGigUpdate {
  gigId: string;
  locationId: string;
  updateType: 'created' | 'updated' | 'cancelled' | 'status-changed';
  gigData: Record<string, unknown>;
  updatedBy: {
    userId: string;
    email: string;
    role: string;
  };
  timestamp: string;
}

export interface SocketNotification {
  id: string;
  from: {
    userId: string;
    email: string;
    role: string;
  };
  to: string;
  type: 'gig-invitation' | 'gig-confirmation-required' | 'booking-request' | 'status-update' | 'message' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
}

export interface SocketTypingIndicator {
  userId: string;
  userEmail: string;
  locationId: string;
  isTyping: boolean;
}

export interface SocketUserPresence {
  userId: string;
  userEmail: string;
  locationId: string;
  status: 'online' | 'away' | 'busy';
  timestamp: string;
}

// Client-to-server event types
export interface ClientToServerEvents {
  'join-location': (locationId: string) => void;
  'leave-location': (locationId: string) => void;
  'send-message': (data: { locationId: string; message: string; type?: 'text' | 'system' }) => void;
  'gig-updated': (data: { gigId: string; locationId: string; updateType: string; gigData: Record<string, unknown> }) => void;
  'send-notification': (data: { targetUserId: string; type: string; title: string; message: string; data?: Record<string, unknown> }) => void;
  'typing-start': (data: { locationId: string }) => void;
  'typing-stop': (data: { locationId: string }) => void;
  'update-presence': (data: { locationId: string; status: 'online' | 'away' | 'busy' }) => void;
  // Fan-specific events
  'join-event': (eventId: string) => void;
  'leave-event': (eventId: string) => void;
  'join-artist': (artistId: string) => void;
  'leave-artist': (artistId: string) => void;
  // Schedule update events
  'schedule-update': (data: { locationId: string; gigId: string; action: string; gigData: Record<string, unknown> }) => void;
}

// Server-to-client event types
export interface ServerToClientEvents {
  'joined-location': (data: { locationId: string; message: string }) => void;
  'left-location': (data: { locationId: string; message: string }) => void;
  'new-message': (message: SocketMessage) => void;
  'gig-update': (update: SocketGigUpdate) => void;
  'notification': (notification: SocketNotification) => void;
  'user-typing': (data: SocketTypingIndicator) => void;
  'user-presence': (data: SocketUserPresence) => void;
  'error': (error: { message: string }) => void;
  // Fan-specific events
  'ticket-update': (update: { eventId: string; ticketsRemaining: number; totalTickets: number; soldOut: boolean; timestamp: string }) => void;
  'price-update': (update: { eventId: string; oldPrice: number; newPrice: number; changeType: 'increase' | 'decrease' | 'dynamic'; timestamp: string }) => void;
  'event-status-update': (update: { eventId: string; oldStatus: string; newStatus: string; statusType: 'cancelled' | 'rescheduled' | 'venue-changed' | 'time-changed'; details?: string; timestamp: string }) => void;
  'artist-notification': (notification: { id: string; artistId: string; artistName: string; eventId: string; eventTitle: string; notificationType: 'new-gig' | 'gig-cancelled' | 'gig-rescheduled' | 'price-drop'; message: string; timestamp: string; read: boolean }) => void;
  // Schedule update events
  'schedule-update': (data: { locationId: string; gigId: string; action: string; gigData: Record<string, unknown> }) => void;
}

// Socket authentication data
export interface SocketAuth {
  token: string;
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
  private messageQueue: Map<string, { messages: SocketMessage[]; timeoutId: NodeJS.Timeout | null }> = new Map();
  private batchTimeout = 100; // ms
  private maxBatchSize = 10; // Maximum messages per batch
  private onBatchReady?: (roomId: string, messages: SocketMessage[]) => void;

  constructor(onBatchReady?: (roomId: string, messages: SocketMessage[]) => void) {
    this.onBatchReady = onBatchReady || (() => {});
  }

  addMessage(roomId: string, message: SocketMessage): void {
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
        this.onBatchReady(roomId, [...batch.messages]);
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
    const roomIds = Array.from(this.messageQueue.keys());
    for (const roomId of roomIds) {
      this.sendBatch(roomId);
    }
  }
}

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

  getSize(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
    this.currentIndex = 0;
  }
}

// Enhanced Socket Manager with Connection Pooling
class OptimizedSocketManager {
  private static instance: OptimizedSocketManager;
  private connections: Map<string, Socket<ServerToClientEvents, ClientToServerEvents>> = new Map();
  private roomSubscriptions: Map<string, Set<string>> = new Map();
  private rateLimiter = new RateLimiter();
  private messageBatcher: MessageBatcher;
  private messageStore = new MessageStore();
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Singleton pattern for connection reuse
  static getInstance(): OptimizedSocketManager {
    if (!OptimizedSocketManager.instance) {
      OptimizedSocketManager.instance = new OptimizedSocketManager();
    }
    return OptimizedSocketManager.instance;
  }

  constructor() {
    // Initialize message batcher with callback
    this.messageBatcher = new MessageBatcher((roomId: string, messages: SocketMessage[]) => {
      this.handleBatchedMessages(roomId, messages);
    });
    
    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupDisconnectedUsers();
    }, 30000); // Clean up every 30 seconds
  }

  private handleBatchedMessages(roomId: string, messages: SocketMessage[]): void {
    // Process batched messages for efficient broadcasting
    const connection = this.connections.get(roomId);
    if (connection?.connected) {
      // Emit batched messages to reduce network overhead
      // Note: 'batch-messages' is not a standard Socket.IO event, so we'll use a different approach
      messages.forEach(message => {
        connection.emit('send-message', message);
      });
    }
  }

  // Smart connection management
  async getConnection(userId: string, token: string): Promise<Socket<ServerToClientEvents, ClientToServerEvents>> {
    const existingConnection = this.connections.get(userId);
    if (existingConnection?.connected) {
      return existingConnection;
    }

    const newConnection = await this.createConnection(token);
    this.connections.set(userId, newConnection);
    return newConnection;
  }

  private async createConnection(token: string): Promise<Socket<ServerToClientEvents, ClientToServerEvents>> {
    return new Promise((resolve, reject) => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      console.log('🔌 Attempting Socket.IO connection to:', backendUrl);
      console.log('🔐 Token provided:', !!token);
      
      const socket = io(backendUrl, {
        auth: { token },
        transports: ['polling'], // Start with polling only to avoid WebSocket issues
        timeout: 20000,
        forceNew: false, // Allow connection reuse
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        upgrade: true, // Allow transport upgrades
        rememberUpgrade: true // Remember successful transport upgrades
      });

      // Set up connection timeout
      const connectionTimeout = setTimeout(() => {
        console.error('❌ Socket.IO connection timeout');
        reject(new Error('Connection timeout'));
      }, 25000);

      socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log('✅ Optimized Socket.IO connected');
        console.log('🔍 DEBUG: Socket connection details:', {
          socketId: socket.id,
          userId: token ? 'token-provided' : 'no-token',
          connected: socket.connected
        });
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ Optimized Socket.IO connection error:', error);
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        
        // Try to provide more helpful error messages
        if (error.message.includes('websocket error')) {
          console.log('🔄 WebSocket failed, Socket.IO will try polling transport automatically');
        } else if (error.message.includes('Authentication token required')) {
          console.log('🔐 Authentication issue - check if user is logged in');
        } else if (error.message.includes('Invalid token payload')) {
          console.log('🔐 Token format issue - check token validity');
        }
        
        reject(error);
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Optimized Socket.IO disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          socket.connect();
        }
      });

      socket.on('error', (error) => {
        console.error('❌ Socket.IO error event:', error);
      });
    });
  }

  // Enhanced room management
  async joinRoom(userId: string, roomId: string): Promise<void> {
    const connection = this.connections.get(userId);
    if (!connection?.connected) {
      throw new Error('No active connection');
    }

    connection.emit('join-location', roomId);
    
    // Track room subscription
    if (!this.roomSubscriptions.has(userId)) {
      this.roomSubscriptions.set(userId, new Set());
    }
    this.roomSubscriptions.get(userId)!.add(roomId);
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    const connection = this.connections.get(userId);
    if (!connection?.connected) {
      return;
    }

    connection.emit('leave-location', roomId);
    
    // Remove room subscription
    const subscriptions = this.roomSubscriptions.get(userId);
    if (subscriptions) {
      subscriptions.delete(roomId);
      if (subscriptions.size === 0) {
        this.roomSubscriptions.delete(userId);
      }
    }
  }

  // Rate-limited message sending with persistence
  sendMessage(userId: string, roomId: string, message: string, type: 'text' | 'system' = 'text'): boolean {
    if (!this.rateLimiter.canSendMessage(userId)) {
      console.warn('Rate limit exceeded for user:', userId);
      return false;
    }

    const connection = this.connections.get(userId);
    if (!connection?.connected) {
      // Store message for offline delivery
      const offlineMessage: SocketMessage = {
        id: Date.now().toString(),
        userId,
        userEmail: '', // Will be populated from user data
        userRole: '', // Will be populated from user data
        locationId: roomId,
        message,
        type,
        timestamp: new Date().toISOString()
      };
      this.messageStore.addOfflineMessage(userId, offlineMessage);
      return false;
    }

    // Create message data
    const messageData: SocketMessage = {
      id: Date.now().toString(),
      userId,
      userEmail: '', // Will be populated from user data
      userRole: '', // Will be populated from user data
      locationId: roomId,
      message,
      type,
      timestamp: new Date().toISOString()
    };

    // Store message for persistence
    this.messageStore.addMessage(roomId, messageData);

    // Add to batch for efficient broadcasting
    this.messageBatcher.addMessage(roomId, messageData);
    
    connection.emit('send-message', { locationId: roomId, message, type });
    return true;
  }

  // Get offline messages for a user
  getOfflineMessages(userId: string): SocketMessage[] {
    return this.messageStore.getOfflineMessages(userId);
  }

  // Get room message history
  getRoomMessages(roomId: string): SocketMessage[] {
    return this.messageStore.getMessages(roomId);
  }

  // Clear room messages
  clearRoomMessages(roomId: string): void {
    this.messageStore.clearRoomMessages(roomId);
  }

  // Automatic cleanup
  private cleanupDisconnectedUsers(): void {
    Array.from(this.connections.entries()).forEach(([userId, socket]) => {
      if (!socket.connected) {
        this.connections.delete(userId);
        this.roomSubscriptions.delete(userId);
        this.rateLimiter.resetLimit(userId);
        this.messageBatcher.clearBatch(userId);
      }
    });
  }

  // Get connection status
  isConnected(userId: string): boolean {
    const connection = this.connections.get(userId);
    return connection?.connected === true;
  }

  // Disconnect specific user
  disconnectUser(userId: string): void {
    const connection = this.connections.get(userId);
    if (connection) {
      connection.disconnect();
      this.connections.delete(userId);
      this.roomSubscriptions.delete(userId);
      this.rateLimiter.resetLimit(userId);
      this.messageBatcher.clearBatch(userId);
    }
  }

  // Real-time Analytics
  getAnalytics(): {
    activeConnections: number;
    totalRooms: number;
    messagesPerSecond: number;
    averageLatency: number;
    memoryUsage: number;
  } {
    return {
      activeConnections: this.connections.size,
      totalRooms: this.roomSubscriptions.size,
      messagesPerSecond: this.calculateMessageRate(),
      averageLatency: this.calculateAverageLatency(),
      memoryUsage: this.calculateMemoryUsage()
    };
  }

  private calculateMessageRate(): number {
    // This would track messages per second over time
    // For now, return a placeholder
    return 0;
  }

  private calculateAverageLatency(): number {
    // This would track average message latency
    // For now, return a placeholder
    return 0;
  }

  private calculateMemoryUsage(): number {
    // Calculate approximate memory usage
    let totalMessages = 0;
    const messages = Array.from(this.messageStore['messages']);
    for (const [, buffer] of messages) {
      totalMessages += buffer.getSize();
    }
    return totalMessages * 0.001; // Rough estimate in MB
  }

  // Cleanup on destroy
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Flush all pending batches
    this.messageBatcher.flushAllBatches();
    
    Array.from(this.connections.keys()).forEach((userId) => {
      this.disconnectUser(userId);
    });
  }
}

// Legacy SocketManager for backward compatibility
class SocketManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private isConnected = false;
  private optimizedManager = OptimizedSocketManager.getInstance();

  // Initialize socket connection
  async connect(token: string): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    // Additional validation for token format
    if (!token || token.length < 10 || !token.includes('.')) {
      console.log('🔐 Invalid token format, skipping socket connection');
      return Promise.resolve();
    }

    const userId = this.getUserIdFromToken(token);
    if (!userId) {
      console.log('🔐 Invalid token: no user ID found, skipping socket connection');
      return Promise.resolve();
    }

    try {
      const connection = await this.optimizedManager.getConnection(userId, token);
      this.socket = connection;
      this.isConnected = true;
      console.log('✅ Socket connection established successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to connect:', error);
      // Don't clear auth data on connection failure - just skip socket connection
      console.log('Socket connection failed, continuing without real-time features');
      console.log('This is normal if the user is not authenticated or server is unavailable');
      return Promise.resolve();
    }
  }

  private getUserIdFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || null;
    } catch {
      return null;
    }
  }

  // Auto-connect with token from localStorage
  async autoConnect(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    const token = localStorage.getItem('authToken');
    
    // Check if token exists and is valid format
    if (!token || token.length < 10 || !token.includes('.')) {
      console.log('⚠️ No valid auth token found, socket connection skipped');
      return Promise.resolve();
    }
    
    if (!this.isConnected) {
      try {
        await this.connect(token);
        console.log('✅ Socket auto-connect successful');
      } catch (error) {
        console.log('⚠️ Socket auto-connect failed, continuing without real-time features:', error);
        // Don't throw error - allow app to continue without real-time features
      }
    }
    return Promise.resolve();
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      const userId = this.getUserIdFromToken(localStorage.getItem('authToken') || '');
      if (userId) {
        this.optimizedManager.disconnectUser(userId);
      }
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if socket is connected
  get connected(): boolean {
    if (!this.socket) return false;
    const userId = this.getUserIdFromToken(localStorage.getItem('authToken') || '');
    return userId ? this.optimizedManager.isConnected(userId) : false;
  }

  // Get socket instance
  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }

  // Location room management
  async joinLocation(locationId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    const userId = token ? this.getUserIdFromToken(token) : null;
    
    if (userId && this.connected) {
      await this.optimizedManager.joinRoom(userId, locationId);
    }
  }

  async leaveLocation(locationId: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    const userId = token ? this.getUserIdFromToken(token) : null;
    
    if (userId) {
      await this.optimizedManager.leaveRoom(userId, locationId);
    }
  }

  // Chat functionality with rate limiting
  sendMessage(locationId: string, message: string, type: 'text' | 'system' = 'text'): boolean {
    const token = localStorage.getItem('authToken');
    const userId = token ? this.getUserIdFromToken(token) : null;
    
    if (!userId) return false;
    
    return this.optimizedManager.sendMessage(userId, locationId, message, type);
  }

  onNewMessage(callback: (message: SocketMessage) => void): void {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  // Gig updates
  sendGigUpdate(gigId: string, locationId: string, updateType: string, gigData: Record<string, unknown>): void {
    if (this.socket && this.connected) {
      this.socket.emit('gig-updated', { gigId, locationId, updateType, gigData });
    }
  }

  onGigUpdate(callback: (update: SocketGigUpdate) => void): void {
    if (this.socket) {
      this.socket.on('gig-update', callback);
    }
  }

  // Notifications
  sendNotification(targetUserId: string, type: string, title: string, message: string, data?: Record<string, unknown>): void {
    if (this.socket && this.connected) {
      this.socket.emit('send-notification', { targetUserId, type, title, message, ...(data && { data }) });
    }
  }

  onNotification(callback: (notification: SocketNotification) => void): void {
    if (this.socket) {
      this.socket.on('notification', (notification) => {
        console.log('🔔 SOCKET: Received notification:', {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          to: notification.to,
          timestamp: notification.timestamp
        });
        callback(notification);
      });
    }
  }

  // Typing indicators
  startTyping(locationId: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('typing-start', { locationId });
    }
  }

  stopTyping(locationId: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('typing-stop', { locationId });
    }
  }

  onUserTyping(callback: (data: SocketTypingIndicator) => void): void {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  // User presence
  updatePresence(locationId: string, status: 'online' | 'away' | 'busy'): void {
    if (this.socket && this.connected) {
      this.socket.emit('update-presence', { locationId, status });
    }
  }

  onUserPresence(callback: (data: SocketUserPresence) => void): void {
    if (this.socket) {
      this.socket.on('user-presence', callback);
    }
  }

  // Room events
  onJoinedLocation(callback: (data: { locationId: string; message: string }) => void): void {
    if (this.socket) {
      this.socket.on('joined-location', callback);
    }
  }

  onLeftLocation(callback: (data: { locationId: string; message: string }) => void): void {
    if (this.socket) {
      this.socket.on('left-location', callback);
    }
  }

  // Error handling
  onError(callback: (error: { message: string }) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove all listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Remove specific listener
  removeListener(event: keyof ServerToClientEvents, callback: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

// Create singleton instance
export const socketManager = new SocketManager();

// React hook for socket connection
export const useSocket = () => {
  return {
    connect: (token: string) => socketManager.connect(token),
    autoConnect: () => socketManager.autoConnect(),
    disconnect: () => socketManager.disconnect(),
    connected: socketManager.connected,
    socket: socketManager.getSocket(),
    joinLocation: (locationId: string) => socketManager.joinLocation(locationId),
    leaveLocation: (locationId: string) => socketManager.leaveLocation(locationId),
    sendMessage: (locationId: string, message: string, type?: 'text' | 'system') => 
      socketManager.sendMessage(locationId, message, type),
    sendGigUpdate: (gigId: string, locationId: string, updateType: string, gigData: Record<string, unknown>) => 
      socketManager.sendGigUpdate(gigId, locationId, updateType, gigData),
    sendNotification: (targetUserId: string, type: string, title: string, message: string, data?: Record<string, unknown>) => 
      socketManager.sendNotification(targetUserId, type, title, message, data),
    startTyping: (locationId: string) => socketManager.startTyping(locationId),
    stopTyping: (locationId: string) => socketManager.stopTyping(locationId),
    updatePresence: (locationId: string, status: 'online' | 'away' | 'busy') => 
      socketManager.updatePresence(locationId, status),
    onNewMessage: (callback: (message: SocketMessage) => void) => socketManager.onNewMessage(callback),
    onGigUpdate: (callback: (update: SocketGigUpdate) => void) => socketManager.onGigUpdate(callback),
    onNotification: (callback: (notification: SocketNotification) => void) => socketManager.onNotification(callback),
    onUserTyping: (callback: (data: SocketTypingIndicator) => void) => socketManager.onUserTyping(callback),
    onUserPresence: (callback: (data: SocketUserPresence) => void) => socketManager.onUserPresence(callback),
    onJoinedLocation: (callback: (data: { locationId: string; message: string }) => void) => socketManager.onJoinedLocation(callback),
    onLeftLocation: (callback: (data: { locationId: string; message: string }) => void) => socketManager.onLeftLocation(callback),
    onError: (callback: (error: { message: string }) => void) => socketManager.onError(callback),
    removeAllListeners: () => socketManager.removeAllListeners(),
    removeListener: (event: keyof ServerToClientEvents, callback: (...args: unknown[]) => void) => socketManager.removeListener(event, callback)
  };
};
