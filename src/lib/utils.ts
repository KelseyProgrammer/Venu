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
      let time = time24.trim()
      
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
    } catch (error) {
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
   * Validate user permissions for gig creation
   */
  async validateGigCreationPermission(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        return { success: false, error: 'No authentication token found' };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          return { success: false, error: 'Session expired' };
        }
        return { success: false, error: 'Failed to validate user permissions' };
      }

      const userData = await response.json();
      if (!userData.success || !userData.data) {
        return { success: false, error: 'Failed to get user data' };
      }

      const user = userData.data;
      if (user.role !== 'location' && user.role !== 'admin') {
        return { success: false, error: 'Only location owners and administrators can create gigs' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Authentication validation error:', error);
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
  }
}; 