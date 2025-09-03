import { useState, useEffect, useCallback } from 'react';
import { locationApi, gigApi, authApi, LocationProfile, GigProfile, apiUtils } from '@/lib/api';

export interface LocationData {
  location: LocationProfile | null;
  gigs: GigProfile[];
  authorizedPromoters: Array<{ id: string; name: string; email: string }>;
  loading: boolean;
  error: string | null;
}

export interface LocationAnalytics {
  totalGigs: number;
  upcomingGigs: number;
  completedGigs: number;
  averageFillRate: number;
  totalRevenue: number;
  monthlyRevenue: number;
  topGenres: Array<{ genre: string; count: number }>;
  averageRating: number;
}

export function useLocation(locationId: string) {
  const [data, setData] = useState<LocationData>({
    location: null,
    gigs: [],
    authorizedPromoters: [],
    loading: true,
    error: null,
  });

  const [analytics, setAnalytics] = useState<LocationAnalytics | null>(null);

  const calculateAnalytics = useCallback((gigs: GigProfile[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const upcomingGigs = gigs.filter(gig => new Date(gig.eventDate) > now && gig.status !== 'completed');
    const completedGigs = gigs.filter(gig => gig.status === 'completed');
    
    // Calculate fill rates
    const fillRates = completedGigs
      .filter(gig => gig.ticketCapacity > 0)
      .map(gig => (gig.ticketsSold / gig.ticketCapacity) * 100);
    const averageFillRate = fillRates.length > 0 
      ? fillRates.reduce((sum, rate) => sum + rate, 0) / fillRates.length 
      : 0;

    // Calculate revenue
    const totalRevenue = completedGigs.reduce((sum, gig) => sum + (gig.ticketsSold * gig.ticketPrice), 0);
    const monthlyRevenue = completedGigs
      .filter(gig => {
        const gigDate = new Date(gig.eventDate);
        return gigDate.getMonth() === currentMonth && gigDate.getFullYear() === currentYear;
      })
      .reduce((sum, gig) => sum + (gig.ticketsSold * gig.ticketPrice), 0);

    // Calculate top genres
    const genreCounts: Record<string, number> = {};
    gigs.forEach(gig => {
      genreCounts[gig.eventGenre] = (genreCounts[gig.eventGenre] || 0) + 1;
    });
    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate average rating
    const ratings = gigs.filter(gig => gig.rating > 0).map(gig => gig.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    setAnalytics({
      totalGigs: gigs.length,
      upcomingGigs: upcomingGigs.length,
      completedGigs: completedGigs.length,
      averageFillRate: Math.round(averageFillRate),
      totalRevenue,
      monthlyRevenue,
      topGenres,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  }, []);

  const fetchLocationData = useCallback(async () => {
    if (!locationId) return;

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch location data, gigs, and promoters in parallel for better performance
      const [locationResponse, gigsResponse, promotersResponse] = await Promise.all([
        locationApi.getLocationById(locationId),
        gigApi.getGigsByLocation(locationId, 1, 100), // Get all gigs for analytics
        locationApi.getAuthorizedPromoters(locationId),
      ]);

      if (locationResponse.success && gigsResponse.success && promotersResponse.success) {
        setData({
          location: locationResponse.data!,
          gigs: gigsResponse.data || [],
          authorizedPromoters: (promotersResponse.data || []).map(user => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
          })),
          loading: false,
          error: null,
        });

        // Calculate analytics from the data
        calculateAnalytics(gigsResponse.data || []);
      } else {
        setData(prev => ({
          ...prev,
          loading: false,
          error: locationResponse.error || gigsResponse.error || promotersResponse.error || 'Failed to fetch location data',
        }));
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch location data',
      }));
    }
  }, [locationId, calculateAnalytics]);

  const updateLocation = useCallback(async (updateData: Partial<LocationProfile>) => {
    if (!data.location) return;

    try {
      const response = await locationApi.updateLocation(data.location._id, updateData);
      if (response.success) {
        setData(prev => ({ ...prev, location: response.data! }));
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error updating location:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update location' };
    }
  }, [data.location]);

  const addPromoter = useCallback(async (promoterId: string) => {
    if (!data.location) return;

    try {
      const response = await locationApi.addPromoterToLocation(data.location._id, promoterId);
      if (response.success) {
        // Refresh promoters list
        const promotersResponse = await locationApi.getAuthorizedPromoters(data.location._id);
        if (promotersResponse.success) {
          setData(prev => ({ 
            ...prev, 
            authorizedPromoters: (promotersResponse.data || []).map(user => ({
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email
            }))
          }));
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error adding promoter:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to add promoter' };
    }
  }, [data.location]);

  const removePromoter = useCallback(async (promoterId: string) => {
    if (!data.location) return;

    try {
      const response = await locationApi.removePromoterFromLocation(data.location._id, promoterId);
      if (response.success) {
        // Refresh promoters list
        const promotersResponse = await locationApi.getAuthorizedPromoters(data.location._id);
        if (promotersResponse.success) {
          setData(prev => ({ 
            ...prev, 
            authorizedPromoters: (promotersResponse.data || []).map(user => ({
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email
            }))
          }));
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error removing promoter:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove promoter' };
    }
  }, [data.location]);

  const refreshData = useCallback(() => {
    fetchLocationData();
  }, [fetchLocationData]);

  useEffect(() => {
    fetchLocationData();
  }, [fetchLocationData]);

  return {
    ...data,
    analytics,
    updateLocation,
    addPromoter,
    removePromoter,
    refreshData,
  };
}

// Hook for location analytics specifically
export function useLocationAnalytics(locationId: string) {
  const [analytics, setAnalytics] = useState<LocationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!locationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await gigApi.getGigsByLocation(locationId, 1, 100);
      if (response.success && response.data) {
        // Calculate analytics (same logic as in useLocation)
        const gigs = response.data;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const upcomingGigs = gigs.filter(gig => new Date(gig.eventDate) > now && gig.status !== 'completed');
        const completedGigs = gigs.filter(gig => gig.status === 'completed');
        
        const fillRates = completedGigs
          .filter(gig => gig.ticketCapacity > 0)
          .map(gig => (gig.ticketsSold / gig.ticketCapacity) * 100);
        const averageFillRate = fillRates.length > 0 
          ? fillRates.reduce((sum, rate) => sum + rate, 0) / fillRates.length 
          : 0;

        const totalRevenue = completedGigs.reduce((sum, gig) => sum + (gig.ticketsSold * gig.ticketPrice), 0);
        const monthlyRevenue = completedGigs
          .filter(gig => {
            const gigDate = new Date(gig.eventDate);
            return gigDate.getMonth() === currentMonth && gigDate.getFullYear() === currentYear;
          })
          .reduce((sum, gig) => sum + (gig.ticketsSold * gig.ticketPrice), 0);

        const genreCounts: Record<string, number> = {};
        gigs.forEach(gig => {
          genreCounts[gig.eventGenre] = (genreCounts[gig.eventGenre] || 0) + 1;
        });
        const topGenres = Object.entries(genreCounts)
          .map(([genre, count]) => ({ genre, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const ratings = gigs.filter(gig => gig.rating > 0).map(gig => gig.rating);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : 0;

        setAnalytics({
          totalGigs: gigs.length,
          upcomingGigs: upcomingGigs.length,
          completedGigs: completedGigs.length,
          averageFillRate: Math.round(averageFillRate),
          totalRevenue,
          monthlyRevenue,
          topGenres,
          averageRating: Math.round(averageRating * 10) / 10,
        });
      } else {
        setError(response.error || 'Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics,
  };
}

// Hook to get current user's location
export function useCurrentUserLocation() {
  const [data, setData] = useState<LocationData>({
    location: null,
    gigs: [],
    authorizedPromoters: [],
    loading: true,
    error: null,
  });

  const [analytics, setAnalytics] = useState<LocationAnalytics | null>(null);

  const calculateAnalytics = useCallback((gigs: GigProfile[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const upcomingGigs = gigs.filter(gig => new Date(gig.eventDate) > now && gig.status !== 'completed');
    const completedGigs = gigs.filter(gig => gig.status === 'completed');
    
    // Calculate fill rates
    const fillRates = completedGigs
      .filter(gig => gig.ticketCapacity > 0)
      .map(gig => (gig.ticketsSold / gig.ticketCapacity) * 100);
    const averageFillRate = fillRates.length > 0 
      ? fillRates.reduce((sum, rate) => sum + rate, 0) / fillRates.length 
      : 0;

    // Calculate revenue
    const totalRevenue = completedGigs.reduce((sum, gig) => sum + (gig.ticketsSold * gig.ticketPrice), 0);
    const monthlyRevenue = completedGigs
      .filter(gig => {
        const gigDate = new Date(gig.eventDate);
        return gigDate.getMonth() === currentMonth && gigDate.getFullYear() === currentYear;
      })
      .reduce((sum, gig) => sum + (gig.ticketsSold * gig.ticketPrice), 0);

    // Calculate top genres
    const genreCounts: Record<string, number> = {};
    gigs.forEach(gig => {
      genreCounts[gig.eventGenre] = (genreCounts[gig.eventGenre] || 0) + 1;
    });
    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate average rating
    const ratings = gigs.filter(gig => gig.rating > 0).map(gig => gig.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    setAnalytics({
      totalGigs: gigs.length,
      upcomingGigs: upcomingGigs.length,
      completedGigs: completedGigs.length,
      averageFillRate: Math.round(averageFillRate),
      totalRevenue,
      monthlyRevenue,
      topGenres,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  }, []);

  const fetchCurrentUserLocation = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check if user is authenticated first
      if (!apiUtils.isAuthenticated()) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Please log in to access the location dashboard.',
        }));
        return;
      }

      // First get the current user profile
      const userResponse = await authApi.getProfile();
      if (!userResponse.success || !userResponse.data) {
        // If authentication fails, clear token and show error
        if (userResponse.error?.includes('Access token') || userResponse.error?.includes('Unauthorized')) {
          apiUtils.removeAuthToken();
        }
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Authentication failed. Please log in again.',
        }));
        return;
      }

      const user = userResponse.data;
      
      // Check if user has location role
      if (user.role !== 'location') {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'User is not a location owner',
        }));
        return;
      }

      // Get the user's location
      const locationResponse = await locationApi.getLocationByUserId(user._id || user.id || "");
      if (!locationResponse.success) {
        // Check if it's a 404 error (location not found)
        if (locationResponse.error?.includes('Location not found') || locationResponse.error?.includes('404')) {
          setData(prev => ({
            ...prev,
            loading: false,
            error: 'No location found. Please create a location profile first.',
          }));
          return;
        }
        // For other errors, show the actual error
        setData(prev => ({
          ...prev,
          loading: false,
          error: locationResponse.error || 'Failed to fetch location data',
        }));
        return;
      }

      if (!locationResponse.data) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'No location found. Please create a location profile first.',
        }));
        return;
      }

      const location = locationResponse.data;

      // Fetch gigs and promoters in parallel
      const [gigsResponse, promotersResponse] = await Promise.all([
        gigApi.getGigsByLocation(location._id, 1, 100),
        locationApi.getAuthorizedPromoters(location._id),
      ]);

      if (gigsResponse.success && promotersResponse.success) {
        setData({
          location,
          gigs: gigsResponse.data || [],
          authorizedPromoters: (promotersResponse.data || []).map(user => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
          })),
          loading: false,
          error: null,
        });

        // Calculate analytics from the data
        calculateAnalytics(gigsResponse.data || []);
      } else {
        setData(prev => ({
          ...prev,
          loading: false,
          error: gigsResponse.error || promotersResponse.error || 'Failed to fetch location data',
        }));
      }
    } catch (error) {
      console.error('Error fetching current user location:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch location data',
      }));
    }
  }, [calculateAnalytics]);

  const updateLocation = useCallback(async (updateData: Partial<LocationProfile>) => {
    if (!data.location) return;

    try {
      const response = await locationApi.updateLocation(data.location._id, updateData);
      if (response.success) {
        setData(prev => ({ ...prev, location: response.data! }));
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error updating location:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update location' };
    }
  }, [data.location]);

  const addPromoter = useCallback(async (promoterId: string) => {
    if (!data.location) return;

    try {
      const response = await locationApi.addPromoterToLocation(data.location._id, promoterId);
      if (response.success) {
        // Refresh promoters list
        const promotersResponse = await locationApi.getAuthorizedPromoters(data.location._id);
        if (promotersResponse.success) {
          setData(prev => ({ 
            ...prev, 
            authorizedPromoters: (promotersResponse.data || []).map(user => ({
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email
            }))
          }));
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error adding promoter:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to add promoter' };
    }
  }, [data.location]);

  const removePromoter = useCallback(async (promoterId: string) => {
    if (!data.location) return;

    try {
      const response = await locationApi.removePromoterFromLocation(data.location._id, promoterId);
      if (response.success) {
        // Refresh promoters list
        const promotersResponse = await locationApi.getAuthorizedPromoters(data.location._id);
        if (promotersResponse.success) {
          setData(prev => ({ 
            ...prev, 
            authorizedPromoters: (promotersResponse.data || []).map((user: any) => ({
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email
            }))
          }));
        }
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error removing promoter:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove promoter' };
    }
  }, [data.location]);

  const refreshData = useCallback(() => {
    fetchCurrentUserLocation();
  }, [fetchCurrentUserLocation]);

  useEffect(() => {
    fetchCurrentUserLocation();
  }, [fetchCurrentUserLocation]);

  // Listen for gig creation events to refresh data
  useEffect(() => {
    const handleGigCreated = () => {
      console.log('Gig created event received, refreshing data...');
      fetchCurrentUserLocation();
    };

    window.addEventListener('gig-created', handleGigCreated);
    
    return () => {
      window.removeEventListener('gig-created', handleGigCreated);
    };
  }, [fetchCurrentUserLocation]);

  return {
    ...data,
    analytics,
    updateLocation,
    addPromoter,
    removePromoter,
    refreshData,
  };
}
