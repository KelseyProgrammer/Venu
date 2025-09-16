// Socket.IO event types for backend
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
  type: 'gig-invitation' | 'gig-confirmation-required' | 'gig-created' | 'gig-status-update' | 'booking-request' | 'status-update' | 'message' | 'system';
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