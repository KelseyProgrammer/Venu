import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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