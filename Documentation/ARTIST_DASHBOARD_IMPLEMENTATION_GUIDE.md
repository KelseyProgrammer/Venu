# Artist Dashboard Implementation Guide

## Overview

This document provides a comprehensive guide on how the Artist Dashboard was implemented, serving as a blueprint for implementing similar dashboards for Location Owners and Promoters. The implementation showcases a modern, real-time, and performant dashboard with advanced features.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Real-Time Features](#real-time-features)
4. [Performance Optimizations](#performance-optimizations)
5. [State Management](#state-management)
6. [UI/UX Patterns](#uiux-patterns)
7. [Implementation Steps](#implementation-steps)
8. [Key Files and Their Roles](#key-files-and-their-roles)
9. [Replication Guide for Other Dashboards](#replication-guide-for-other-dashboards)

## Architecture Overview

The Artist Dashboard follows a modern React architecture with the following key principles:

- **Component-Based Architecture**: Modular, reusable components
- **Real-Time Communication**: Socket.IO integration for live updates
- **Performance Optimization**: Memoization, lazy loading, and efficient rendering
- **Type Safety**: Full TypeScript implementation
- **Error Boundaries**: Graceful error handling
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Technology Stack

- **Frontend**: React 18, TypeScript, Next.js
- **Styling**: Tailwind CSS with shadcn/ui components
- **Real-Time**: Socket.IO client
- **State Management**: React hooks with custom hooks
- **Performance**: React.memo, useMemo, useCallback
- **Error Handling**: Custom error boundaries

## Core Components

### 1. Main Dashboard Component (`artist-dashboard.tsx`)

The main dashboard is a comprehensive component that orchestrates all features:

```typescript
export function ArtistDashboard() {
  // State management
  const [activeTab, setActiveTab] = useState("discover")
  const [selectedGig, setSelectedGig] = useState<string | null>(null)
  
  // Real-time features
  const { autoConnect } = useSocket()
  const { notifications, gigUpdates, sendGigUpdate, isConnected } = useArtistRealTime({ artistId })
  
  // Performance optimizations
  const [isPending, startTransition] = useTransition()
  
  // Component structure with tabs
  return (
    <PerformanceErrorBoundary componentName="ArtistDashboard">
      <div className="min-h-screen bg-background">
        {/* Header with real-time indicators */}
        {/* Stats cards */}
        {/* Tab navigation */}
        {/* Tab content */}
      </div>
    </PerformanceErrorBoundary>
  )
}
```

### 2. Real-Time Hook (`useArtistRealTime.ts`)

Custom hook that manages all real-time functionality:

```typescript
export const useArtistRealTime = ({ artistId }: UseArtistRealTimeProps = {}): UseArtistRealTimeReturn => {
  // Unified real-time hook implementation
  const unifiedHook = useUnifiedRealTime({
    userId,
    userRole,
    artistId: artistId || '',
    locationId: 'artist-dashboard'
  });
  
  return unifiedHook;
};
```

### 3. Socket Management (`socket.ts`)

Advanced socket management with connection pooling and optimization:

```typescript
class OptimizedSocketManager {
  private static instance: OptimizedSocketManager;
  private connections: Map<string, Socket> = new Map();
  private rateLimiter = new RateLimiter();
  private messageBatcher: MessageBatcher;
  
  // Singleton pattern for connection reuse
  static getInstance(): OptimizedSocketManager {
    if (!OptimizedSocketManager.instance) {
      OptimizedSocketManager.instance = new OptimizedSocketManager();
    }
    return OptimizedSocketManager.instance;
  }
}
```

## Real-Time Features

### 1. Live Notifications

Real-time notifications for:
- Booking requests
- Gig updates
- Messages
- System notifications

```typescript
// Notification handling
const notificationCounts = useMemo(() => {
  const bookingRequests = notifications.filter(n => n.type === 'booking-request' && !n.read).length
  const messages = notifications.filter(n => n.type === 'message' && !n.read).length
  const newGigs = gigUpdates.filter(u => u.updateType === 'created').length
  
  return { bookingRequests, messages, newGigs, totalUpdates: gigUpdates.length }
}, [notifications, gigUpdates])
```

### 2. Live Chat

Real-time chat with venues and promoters:

```typescript
<RealTimeChat 
  locationId="artist-dashboard" 
  currentUserId="artist-123"
  className="h-96"
/>
```

### 3. Gig Updates

Live updates for gig status changes:

```typescript
<RealTimeGigUpdates locationId="artist-dashboard" />
```

### 4. Connection Status

Visual indicators for connection status:

```typescript
<div className="flex items-center gap-1 text-xs">
  <div className={`w-2 h-2 rounded-full ${realTimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
  <span className="text-muted-foreground">
    {realTimeConnected ? 'Live' : 'Offline'}
  </span>
</div>
```

## Performance Optimizations

### 1. Memoization

Extensive use of `useMemo` and `useCallback` to prevent unnecessary re-renders:

```typescript
// Memoized gig bonus tiers calculation
const gigBonusTiers = useMemo(() => {
  return mockGigs.reduce((acc, gig) => {
    acc[gig.id] = getGigBonusTiers(gig)
    return acc
  }, {} as Record<number, ReturnType<typeof calculateEventBonusTiers>>)
}, [mockGigs, getGigBonusTiers])

// Memoized calendar data
const calendarData = useMemo(() => {
  const todayDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  const bookingMap = new Map<string, Booking>()
  filteredBookings.forEach(booking => {
    const bookingDate = new Date(booking.date)
    const key = `${bookingDate.getDate()}-${bookingDate.getMonth()}-${bookingDate.getFullYear()}`
    bookingMap.set(key, booking)
  })
  
  return { todayDate, currentMonth, currentYear, bookingMap, daysInMonth: new Date(currentYear, currentMonth + 1, 0).getDate() }
}, [currentDate, filteredBookings])
```

### 2. Lazy Loading

Dynamic imports for better code splitting:

```typescript
const GigDetailsLazy = memo(function GigDetailsLazy({ gigId, onBack, gigData }: GigDetailsProps) {
  const [Component, setComponent] = useState<React.ComponentType<GigDetailsProps> | null>(null)
  
  useEffect(() => {
    import("./gig-details").then((module) => {
      setComponent(() => module.GigDetails as unknown as React.ComponentType<GigDetailsProps>)
    })
  }, [])
  
  if (!Component) {
    return <div className="flex items-center justify-center p-8">Loading gig details...</div>
  }
  
  return <Component gigId={gigId} onBack={onBack} gigData={gigData} />
})
```

### 3. Component Memoization

All major components are wrapped with `React.memo`:

```typescript
const GigCard = memo(function GigCard({ gig, gigBonusTiers, onSelectGig, onBookGig }: GigCardProps) {
  // Component implementation
})

const CalendarDay = memo(function CalendarDay({ day, currentMonth, currentYear, today, bookingOnDate, availableDates, unavailableDates, availabilityFilter, onToggleAvailability }: CalendarDayProps) {
  // Component implementation
})
```

### 4. Transition API

Use of React's `useTransition` for non-blocking updates:

```typescript
const [isPending, startTransition] = useTransition()

const handleTabChange = useCallback((value: string) => {
  startTransition(() => {
    setActiveTab(value)
  })
}, [startTransition])
```

## State Management

### 1. Local State

Comprehensive local state management:

```typescript
// Tab management
const [activeTab, setActiveTab] = useState("discover")
const [scheduleSubcategory, setScheduleSubcategory] = useState("list")

// Filter states
const [scheduleFilter, setScheduleFilter] = useState("all")
const [availabilityFilter, setAvailabilityFilter] = useState("all")

// Calendar state
const [currentDate, setCurrentDate] = useState(new Date())
const [availableDates, setAvailableDates] = useState<string[]>([])
const [unavailableDates, setUnavailableDates] = useState<string[]>([])

// Modal state
const [showEventDetailsModal, setShowEventDetailsModal] = useState(false)
const [selectedBookingForModal, setSelectedBookingForModal] = useState<Booking | null>(null)
```

### 2. Persistence

LocalStorage integration for data persistence:

```typescript
// Load availability data from localStorage on mount
useEffect(() => {
  if (isClient) {
    try {
      const savedAvailableDates = localStorage.getItem('artist-available-dates')
      const savedUnavailableDates = localStorage.getItem('artist-unavailable-dates')
      
      if (savedAvailableDates) {
        setAvailableDates(JSON.parse(savedAvailableDates))
      }
      if (savedUnavailableDates) {
        setUnavailableDates(JSON.parse(savedUnavailableDates))
      }
    } catch (error) {
      console.error('Error loading availability data from localStorage:', error)
    }
  }
}, [isClient])

// Debounced localStorage save function
const debouncedLocalStorageSave = useCallback(
  (key: string, data: string[]) => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data))
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error)
      }
    }, 300) // Debounce by 300ms
    
    return () => clearTimeout(timeoutId)
  },
  []
)
```

## UI/UX Patterns

### 1. Tab-Based Navigation

Clean tab navigation with active state indicators:

```typescript
<TabsList className="w-full grid grid-cols-6 bg-card border-b border-border rounded-none h-12">
  <TabsTrigger
    value="discover"
    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2"
  >
    <Search className="h-4 w-4" />
    Discover
  </TabsTrigger>
  {/* More tabs... */}
</TabsList>
```

### 2. Status Indicators

Visual status indicators with color coding:

```typescript
<Badge 
  variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'outline'}
  className={`text-xs ${
    booking.status === "confirmed" 
      ? "bg-green-600" 
      : booking.status === "pending"
      ? "bg-yellow-600"
      : booking.isPast
      ? "bg-blue-600"
      : "bg-gray-600"
  }`}
>
  {booking.status === "confirmed" 
    ? "Confirmed" 
    : booking.status === "pending"
    ? "Needs Band"
    : booking.isPast
    ? "Past Show"
    : booking.status
  }
</Badge>
```

### 3. Interactive Calendar

Advanced calendar with availability management:

```typescript
const CalendarDay = memo(function CalendarDay({
  day, currentMonth, currentYear, today, bookingOnDate,
  availableDates, unavailableDates, availabilityFilter, onToggleAvailability
}: CalendarDayProps) {
  const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const isAvailable = availableDates.includes(dateString)
  const isUnavailable = unavailableDates.includes(dateString)
  
  const handleClick = useCallback(() => {
    if (!isPast && !bookingOnDate) {
      onToggleAvailability(dateString)
    }
  }, [isPast, bookingOnDate, dateString, onToggleAvailability])
  
  // Complex styling logic based on state
  return (
    <div 
      onClick={handleClick}
      className={`h-20 p-2 rounded-lg border transition-all duration-200 ${
        // Dynamic styling based on availability and booking status
      }`}
    >
      {/* Calendar day content */}
    </div>
  )
})
```

### 4. Modal System

Comprehensive modal system for detailed views:

```typescript
const ArtistEventDetailsModal = memo(function ArtistEventDetailsModal({ booking, isOpen, onClose }: ArtistEventDetailsModalProps) {
  const formatTime12Hour = useCallback((time24: string): string => {
    // 24-hour to 12-hour conversion logic
  }, [])
  
  const progress = useMemo(() => {
    if (!booking) return 0
    return (booking.ticketsSold / booking.totalTickets) * 100
  }, [booking])
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Modal content */}
      </DialogContent>
    </Dialog>
  )
})
```

## Implementation Steps

### Step 1: Setup Core Infrastructure

1. **Create the main dashboard component**
2. **Implement the real-time hook**
3. **Set up socket management**
4. **Add error boundaries**

### Step 2: Implement Real-Time Features

1. **Socket.IO integration**
2. **Notification system**
3. **Live chat functionality**
4. **Gig update system**

### Step 3: Add Performance Optimizations

1. **Memoization strategies**
2. **Lazy loading implementation**
3. **Component optimization**
4. **State management optimization**

### Step 4: Build UI Components

1. **Tab navigation system**
2. **Card components**
3. **Calendar implementation**
4. **Modal system**

### Step 5: Add Advanced Features

1. **Availability management**
2. **Filter systems**
3. **Search functionality**
4. **Analytics integration**

## Key Files and Their Roles

### Frontend Files

1. **`src/components/artist-dashboard.tsx`** - Main dashboard component
2. **`src/hooks/useArtistRealTime.ts`** - Real-time functionality hook
3. **`src/lib/socket.ts`** - Socket management and optimization
4. **`src/components/ui/error-boundary.tsx`** - Error handling
5. **`src/lib/api.ts`** - API integration
6. **`src/lib/utils.ts`** - Utility functions

### Backend Files

1. **`backend/src/socket/socketHandlers.ts`** - Socket.IO server handlers
2. **`backend/src/socket/types.ts`** - Socket type definitions
3. **`backend/src/routes/artists.routes.ts`** - Artist API routes
4. **`backend/src/models/Artist.ts`** - Artist data model

## Replication Guide for Other Dashboards

### For Location Dashboard

1. **Create `location-dashboard.tsx`** following the same structure
2. **Implement `useLocationRealTime.ts`** hook
3. **Adapt the socket handlers** for location-specific events
4. **Modify the UI components** for location owner needs
5. **Update the API routes** for location-specific data

### For Promoter Dashboard

1. **Create `promoter-dashboard.tsx`** following the same structure
2. **Implement `usePromoterRealTime.ts`** hook
3. **Adapt the socket handlers** for promoter-specific events
4. **Modify the UI components** for promoter needs
5. **Update the API routes** for promoter-specific data

### Key Adaptations Needed

#### 1. Real-Time Hook Adaptation

```typescript
// For Location Dashboard
export const useLocationRealTime = ({ locationId }: UseLocationRealTimeProps = {}): UseLocationRealTimeReturn => {
  const unifiedHook = useUnifiedRealTime({
    userId,
    userRole: 'location-owner',
    locationId: locationId || '',
    artistId: '' // Not needed for location owners
  });
  
  return unifiedHook;
};

// For Promoter Dashboard
export const usePromoterRealTime = ({ promoterId, locationId }: UsePromoterRealTimeProps = {}): UsePromoterRealTimeReturn => {
  const unifiedHook = useUnifiedRealTime({
    userId,
    userRole: 'promoter',
    locationId: locationId || '',
    promoterId: promoterId || ''
  });
  
  return unifiedHook;
};
```

#### 2. Component Structure Adaptation

```typescript
// Location Dashboard tabs
const locationTabs = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "artists", label: "Artists", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "profile", label: "Profile", icon: User },
  { id: "more", label: "More", icon: MoreHorizontal }
];

// Promoter Dashboard tabs
const promoterTabs = [
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "events", label: "Events", icon: Calendar },
  { id: "artists", label: "Artists", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "profile", label: "Profile", icon: User }
];
```

#### 3. Socket Handler Adaptation

```typescript
// In socketHandlers.ts, add role-specific event handling
const eventHandlers = {
  'location-owner': {
    onGigUpdate: (update: SocketGigUpdate) => {
      if (update.locationId === locationId) {
        setGigUpdates(prev => [update, ...prev].slice(0, 50));
      }
    },
    onMessage: (message: SocketMessage) => {
      if (message.locationId === locationId) {
        setMessages(prev => [...prev, message].slice(0, 100));
      }
    },
    onNotification: (notification: SocketNotification) => {
      if (notification.to === userId) {
        setNotifications(prev => [notification, ...prev].slice(0, 100));
      }
    }
  },
  'promoter': {
    onGigUpdate: (update: SocketGigUpdate) => {
      if (update.locationId === locationId) {
        setGigUpdates(prev => [update, ...prev].slice(0, 50));
      }
    },
    onMessage: (message: SocketMessage) => {
      if (message.locationId === locationId) {
        setMessages(prev => [...prev, message].slice(0, 100));
      }
    },
    onNotification: (notification: SocketNotification) => {
      if (notification.to === userId) {
        setNotifications(prev => [notification, ...prev].slice(0, 100));
      }
    }
  }
};
```

## Best Practices

### 1. Performance

- Always use `React.memo` for components that receive props
- Implement `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to child components
- Implement lazy loading for heavy components
- Use `useTransition` for non-blocking updates

### 2. Real-Time Features

- Implement proper error handling for socket connections
- Use connection pooling for multiple socket instances
- Implement rate limiting for message sending
- Add offline message queuing
- Provide visual feedback for connection status

### 3. State Management

- Use local state for UI-only state
- Implement localStorage for persistence where appropriate
- Use debounced functions for frequent updates
- Implement proper cleanup in useEffect hooks

### 4. Error Handling

- Wrap components in error boundaries
- Provide fallback UI for failed states
- Log errors for debugging
- Provide user-friendly error messages

### 5. Accessibility

- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation works
- Provide sufficient color contrast
- Add loading states for async operations

## Conclusion

The Artist Dashboard implementation provides a robust foundation for building similar dashboards for Location Owners and Promoters. The key is to maintain the same architectural patterns while adapting the specific functionality to each user role's needs.

The implementation demonstrates modern React best practices, real-time communication, performance optimization, and comprehensive error handling. By following this guide, you can create consistent, performant, and feature-rich dashboards for all user types in the VENU platform.

## Next Steps

1. **Review the existing code** to understand the current implementation
2. **Identify the specific needs** for Location and Promoter dashboards
3. **Create the new dashboard components** following the established patterns
4. **Implement the real-time hooks** for each user type
5. **Test thoroughly** to ensure all features work correctly
6. **Optimize performance** based on usage patterns
7. **Add any role-specific features** that weren't covered in the Artist Dashboard

This implementation guide should provide everything needed to successfully replicate the Artist Dashboard's functionality for other user types while maintaining consistency and performance across the platform.
