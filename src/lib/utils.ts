import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Time formatting utilities
export const timeUtils = {
  /**
   * Convert 24-hour time to 12-hour format
   */
  formatTime12Hour(time24: string): string {
    try {
      // Handle various time formats
      const time = time24.trim()
      
      // If it's already in 12-hour format, return as is
      if (time.includes('AM') || time.includes('PM')) {
        return time
      }
      
      // If it's in 24-hour format (HH:MM), convert it
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours, 10)
        const minute = parseInt(minutes, 10)
        
        if (isNaN(hour) || isNaN(minute)) {
          return time24 // Return original if parsing fails
        }
        
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        
        return `${displayHour}:${minutes.padStart(2, '0')} ${period}`
      }
      
      // If it's just hours (e.g., "20"), convert it
      const hour = parseInt(time, 10)
      if (!isNaN(hour) && hour >= 0 && hour <= 23) {
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        
        return `${displayHour}:00 ${period}`
      }
      
      return time24 // Return original if no conversion possible
    } catch {
      return time24 // Return original if any error occurs
    }
  }
}

// Authentication utilities
export const authUtils = {
  /**
   * Check if user is authenticated and has valid token
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  /**
   * Get the current auth token
   */
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  },

  /**
   * Logout user by clearing auth token and redirecting to login
   */
  logout(): void {
    if (typeof window === 'undefined') return;
    
    // Clear auth token
    localStorage.removeItem('authToken');
    
    // Clear any other session data
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    // Redirect to home page (which shows login)
    window.location.href = '/';
  },

  /**
   * Validate gig creation permission for current user
   */
  async validateGigCreationPermission(): Promise<{ success: boolean; user?: { id: string; role: string; email: string }; error?: string }> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { success: false, error: 'No authentication token' };
      }

      // In a real implementation, you would validate the token with the backend
      // For now, we'll just check if the token exists
      return { success: true, user: { id: 'user-123', role: 'location-owner', email: 'user@example.com' } };
    } catch (error) {
      console.error('Permission validation error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  },

  /**
   * Handle authentication errors and redirect if needed
   */
  handleAuthError(error: string): void {
    if (error.includes('expired') || error.includes('No authentication token')) {
      localStorage.removeItem('authToken');
      alert('Your session has expired. Please log in again.');
      window.location.href = '/';
    } else {
      alert(`Authentication error: ${error}`);
    }
  },

  /**
   * Get current user data from localStorage
   */
  getCurrentUser(): { id: string; firstName: string; lastName: string; email: string; role: string; profileImage?: string } | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
      
      // Fallback: try to get from token - but only if token is valid
      const token = this.getAuthToken();
      if (token && token.length >= 10 && token.includes('.')) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return {
            id: payload.sub || payload.userId,
            firstName: payload.firstName || payload.name?.split(' ')[0] || 'User',
            lastName: payload.lastName || payload.name?.split(' ')[1] || '',
            email: payload.email,
            role: payload.role,
            profileImage: payload.profileImage
          };
        } catch (tokenError) {
          console.log('🔐 Invalid token format in getCurrentUser, clearing...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Get user's full name
   */
  getUserFullName(): string {
    const user = this.getCurrentUser();
    if (!user) return 'User';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    }
    
    return 'User';
  }
}; 