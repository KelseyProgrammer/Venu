# Socket.io Real-time Implementation

This document outlines the Socket.io implementation for real-time functionality in the VENU application.

## Overview

Socket.io has been integrated to provide real-time communication features including:
- Real-time chat for location-specific conversations
- Live gig updates and notifications
- User presence indicators
- Typing indicators

## Backend Implementation

### Files Created/Modified

1. **`backend/src/socket/socketHandlers.ts`** - Main Socket.io event handlers
2. **`backend/src/socket/types.ts`** - TypeScript interfaces for Socket.io events
3. **`backend/src/server.ts`** - Updated to integrate Socket.io with Express server

### Key Features

- **Authentication Middleware**: JWT-based authentication for socket connections
- **Room Management**: Location-specific rooms for targeted messaging
- **Event Handlers**: 
  - Chat messages
  - Gig updates
  - Notifications
  - Typing indicators
  - User presence

### Socket Events

#### Client to Server
- `join-location` - Join a location-specific room
- `leave-location` - Leave a location-specific room
- `send-message` - Send chat message
- `gig-updated` - Send gig update
- `send-notification` - Send notification to user
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator
- `update-presence` - Update user presence status

#### Server to Client
- `joined-location` - Confirmation of joining location room
- `left-location` - Confirmation of leaving location room
- `new-message` - New chat message received
- `gig-update` - Gig update received
- `notification` - Notification received
- `user-typing` - User typing indicator
- `user-presence` - User presence update
- `error` - Error message

## Frontend Implementation

### Files Created

1. **`src/lib/socket.ts`** - Socket.io client manager and React hooks
2. **`src/hooks/useChat.ts`** - Chat functionality hook
3. **`src/hooks/useGigUpdates.ts`** - Gig updates hook
4. **`src/hooks/useNotifications.ts`** - Notifications hook
5. **`src/components/real-time-chat.tsx`** - Real-time chat component
6. **`src/components/real-time-notifications.tsx`** - Notifications component
7. **`src/components/real-time-gig-updates.tsx`** - Gig updates component

### Files Modified

1. **`src/components/location-dashboard/chat-tab.tsx`** - Updated to use real-time chat
2. **`src/components/location-dashboard/location-dashboard.tsx`** - Added real-time components
3. **`src/components/location-dashboard/post-gig-flow.tsx`** - Added Socket.io integration for gig creation

### Key Features

- **Socket Manager**: Singleton pattern for managing socket connections
- **React Hooks**: Custom hooks for different real-time features
- **Real-time Components**: Ready-to-use components for chat, notifications, and updates
- **Authentication**: Automatic token-based authentication
- **Error Handling**: Comprehensive error handling and connection management

## Usage Examples

### Basic Socket Connection

```typescript
import { useSocket } from '@/lib/socket';

const { connect, disconnect, connected } = useSocket();

// Connect with authentication token
await connect(localStorage.getItem('token'));
```

### Real-time Chat

```typescript
import { useChat } from '@/hooks/useChat';

const {
  messages,
  sendMessage,
  isConnected,
  typingUsers
} = useChat({
  locationId: 'location-123',
  currentUserId: 'user-456'
});
```

### Real-time Notifications

```typescript
import { useNotifications } from '@/hooks/useNotifications';

const {
  notifications,
  unreadCount,
  sendNotification,
  markAsRead
} = useNotifications();
```

### Real-time Gig Updates

```typescript
import { useGigUpdates } from '@/hooks/useGigUpdates';

const {
  gigUpdates,
  sendGigUpdate,
  isConnected
} = useGigUpdates({
  locationId: 'location-123'
});
```

## Integration Points

### Location Dashboard

The location dashboard now includes:
- Real-time chat in the Chat tab
- Notification bell in the header
- Gig updates indicator in the header

### Post Gig Flow

When a gig is published:
- Real-time gig update is sent to all location room members
- Notifications are sent to invited bands, promoters, and door staff
- All connected users receive live updates

## Authentication

Socket connections are authenticated using JWT tokens:
- Token is passed in the `auth` object during connection
- Server validates token and attaches user data to socket
- All events include user context for authorization

## Room Management

- **User Rooms**: `user:${userId}` - For personal notifications
- **Location Rooms**: `location:${locationId}` - For location-specific events
- **Automatic Cleanup**: Users are removed from rooms on disconnect

## Error Handling

- Connection errors are handled gracefully
- Authentication failures are logged and reported
- Network issues are managed with automatic reconnection
- User-friendly error messages are displayed

## Performance Considerations

- **Connection Pooling**: Single socket connection per user
- **Room Management**: Efficient room joining/leaving
- **Message Batching**: Optimized for high-frequency updates
- **Memory Management**: Automatic cleanup of disconnected users

## Security

- **JWT Authentication**: All connections require valid tokens
- **Room Authorization**: Users can only join authorized rooms
- **Input Validation**: All messages are validated before processing
- **Rate Limiting**: Built-in protection against spam

## Development Notes

- All components follow the established purple theme from CURSOR_RULES
- TypeScript interfaces ensure type safety
- Components are fully responsive and mobile-optimized
- Error boundaries prevent crashes from socket issues

## Future Enhancements

- Voice/video calling integration
- File sharing in chat
- Push notifications for mobile
- Message persistence and history
- Advanced presence features
- Message reactions and threading
