import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FanDashboard } from '../src/components/fan-dashboard';
import { useFanRealTime } from '../src/hooks/useFanRealTime';

// Mock the Socket.IO hook
vi.mock('../src/hooks/useFanRealTime');
const mockUseFanRealTime = vi.mocked(useFanRealTime);

// Mock the real-time components
vi.mock('../src/components/real-time-fan-notifications', () => ({
  RealTimeFanNotifications: ({ userId }: { userId: string }) => (
    <div data-testid="real-time-notifications">Notifications for {userId}</div>
  )
}));

vi.mock('../src/components/real-time-events-grid', () => ({
  RealTimeEventsGrid: ({ events, userId }: { events: any[], userId: string }) => (
    <div data-testid="real-time-events-grid">
      {events.length} events for {userId}
    </div>
  )
}));

describe('Fan Dashboard Socket.IO Integration', () => {
  beforeEach(() => {
    // Mock the useFanRealTime hook
    mockUseFanRealTime.mockReturnValue({
      isConnected: true,
      error: null,
      ticketUpdates: [],
      lastTicketUpdate: null,
      priceUpdates: [],
      lastPriceUpdate: null,
      eventStatusUpdates: [],
      lastEventStatusUpdate: null,
      artistNotifications: [],
      unreadArtistNotifications: 0,
      markArtistNotificationAsRead: vi.fn(),
      markAllArtistNotificationsAsRead: vi.fn(),
      subscribeToEvent: vi.fn(),
      unsubscribeFromEvent: vi.fn(),
      subscribeToArtist: vi.fn(),
      unsubscribeFromArtist: vi.fn()
    });
  });

  it('should render with real-time components', () => {
    render(<FanDashboard />);
    
    // Check that real-time notifications are rendered
    expect(screen.getByTestId('real-time-notifications')).toBeInTheDocument();
    
    // Check that real-time events grid is rendered
    expect(screen.getByTestId('real-time-events-grid')).toBeInTheDocument();
  });

  it('should show connection status when connected', () => {
    render(<FanDashboard />);
    
    // Check for "Live" status indicator
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('should show offline status when disconnected', () => {
    mockUseFanRealTime.mockReturnValue({
      isConnected: false,
      error: null,
      ticketUpdates: [],
      lastTicketUpdate: null,
      priceUpdates: [],
      lastPriceUpdate: null,
      eventStatusUpdates: [],
      lastEventStatusUpdate: null,
      artistNotifications: [],
      unreadArtistNotifications: 0,
      markArtistNotificationAsRead: vi.fn(),
      markAllArtistNotificationsAsRead: vi.fn(),
      subscribeToEvent: vi.fn(),
      unsubscribeFromEvent: vi.fn(),
      subscribeToArtist: vi.fn(),
      unsubscribeFromArtist: vi.fn()
    });

    render(<FanDashboard />);
    
    // Check for "Offline" status indicator
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should call subscribeToEvent when adding event to favorites', async () => {
    const mockSubscribeToEvent = vi.fn();
    const mockUnsubscribeFromEvent = vi.fn();
    
    mockUseFanRealTime.mockReturnValue({
      isConnected: true,
      error: null,
      ticketUpdates: [],
      lastTicketUpdate: null,
      priceUpdates: [],
      lastPriceUpdate: null,
      eventStatusUpdates: [],
      lastEventStatusUpdate: null,
      artistNotifications: [],
      unreadArtistNotifications: 0,
      markArtistNotificationAsRead: vi.fn(),
      markAllArtistNotificationsAsRead: vi.fn(),
      subscribeToEvent: mockSubscribeToEvent,
      unsubscribeFromEvent: mockUnsubscribeFromEvent,
      subscribeToArtist: vi.fn(),
      unsubscribeFromArtist: vi.fn()
    });

    render(<FanDashboard />);
    
    // The component should automatically subscribe to favorite events
    await waitFor(() => {
      expect(mockSubscribeToEvent).toHaveBeenCalled();
    });
  });

  it('should handle real-time errors gracefully', () => {
    mockUseFanRealTime.mockReturnValue({
      isConnected: true,
      error: 'Connection failed',
      ticketUpdates: [],
      lastTicketUpdate: null,
      priceUpdates: [],
      lastPriceUpdate: null,
      eventStatusUpdates: [],
      lastEventStatusUpdate: null,
      artistNotifications: [],
      unreadArtistNotifications: 0,
      markArtistNotificationAsRead: vi.fn(),
      markAllArtistNotificationsAsRead: vi.fn(),
      subscribeToEvent: vi.fn(),
      unsubscribeFromEvent: vi.fn(),
      subscribeToArtist: vi.fn(),
      unsubscribeFromArtist: vi.fn()
    });

    render(<FanDashboard />);
    
    // The component should still render even with errors
    expect(screen.getByText('Fan Dashboard')).toBeInTheDocument();
  });
});
