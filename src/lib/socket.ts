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
  type: 'gig-invitation' | 'booking-request' | 'status-update' | 'message' | 'system';
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
}

// Socket authentication data
export interface SocketAuth {
  token: string;
}

class SocketManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private token: string | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  // Initialize socket connection
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      // If already connecting, return the existing promise
      if (this.connectionPromise) {
        this.connectionPromise.then(resolve).catch(reject);
        return;
      }

      this.token = token;
      
      this.socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.connectionPromise = new Promise<void>((innerResolve, innerReject) => {
        this.socket!.on('connect', () => {
          console.log('✅ Socket.IO connected');
          this.isConnected = true;
          this.connectionPromise = null;
          innerResolve();
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          console.error('❌ Socket.IO connection error:', error);
          this.isConnected = false;
          this.connectionPromise = null;
          innerReject(error);
          reject(error);
        });

        this.socket!.on('disconnect', (reason) => {
          console.log('❌ Socket.IO disconnected:', reason);
          this.isConnected = false;
          this.connectionPromise = null;
        });

        this.socket!.on('error', (error) => {
          console.error('❌ Socket.IO error:', error);
        });
      });
    });
  }

  // Auto-connect with token from localStorage
  autoConnect(): Promise<void> {
    if (typeof window === 'undefined') {
      return Promise.resolve();
    }

    const token = localStorage.getItem('authToken');
    if (token && !this.isConnected) {
      return this.connect(token);
    } else if (!token) {
      console.log('⚠️ No auth token found, socket connection skipped');
      return Promise.resolve();
    }
    return Promise.resolve();
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.token = null;
    }
  }

  // Check if socket is connected
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Get socket instance
  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }

  // Location room management
  joinLocation(locationId: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('join-location', locationId);
    }
  }

  leaveLocation(locationId: string): void {
    if (this.socket && this.connected) {
      this.socket.emit('leave-location', locationId);
    }
  }

  // Chat functionality
  sendMessage(locationId: string, message: string, type: 'text' | 'system' = 'text'): void {
    if (this.socket && this.connected) {
      this.socket.emit('send-message', { locationId, message, type });
    }
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
      this.socket.emit('send-notification', { targetUserId, type, title, message, data });
    }
  }

  onNotification(callback: (notification: SocketNotification) => void): void {
    if (this.socket) {
      this.socket.on('notification', callback);
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
