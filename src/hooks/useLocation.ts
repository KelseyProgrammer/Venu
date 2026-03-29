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

  const fetchLocationData = useCallback(async () => {
    if (!locationId) return;

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [locationResponse, gigsResponse, promotersResponse, analyticsResponse] = await Promise.all([
        locationApi.getLocationById(locationId),
        gigApi.getGigsByLocation(locationId, 1, 100),
        locationApi.getAuthorizedPromoters(locationId),
        locationApi.getLocationAnalytics(locationId),
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

        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data);
        }
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
  }, [locationId]);

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
      const response = await locationApi.getLocationAnalytics(locationId);
      if (response.success && response.data) {
        setAnalytics(response.data);
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

  const fetchCurrentUserLocation = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (!apiUtils.isAuthenticated()) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Please log in to access the location dashboard.',
        }));
        return;
      }

      const userResponse = await authApi.getProfile();
      if (!userResponse.success || !userResponse.data) {
        if (userResponse.error?.includes('Access token') ||
            userResponse.error?.includes('Unauthorized') ||
            userResponse.error?.includes('Invalid token') ||
            userResponse.error?.includes('User not found')) {
          apiUtils.removeAuthToken();
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
        }
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Authentication failed. Please log in again.',
        }));
        return;
      }

      const user = userResponse.data;

      if (user.role !== 'location') {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'User is not a location owner',
        }));
        return;
      }

      const locationResponse = await locationApi.getLocationByUserId(user._id || user.id || "");
      if (!locationResponse.success) {
        if (locationResponse.error?.includes('Location not found') || locationResponse.error?.includes('404')) {
          setData(prev => ({
            ...prev,
            loading: false,
            error: 'No location found. Please create a location profile first.',
          }));
          return;
        }
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

      const [gigsResponse, promotersResponse, analyticsResponse] = await Promise.all([
        gigApi.getGigsByLocation(location._id, 1, 100),
        locationApi.getAuthorizedPromoters(location._id),
        locationApi.getLocationAnalytics(location._id),
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

        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data);
        }
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
  }, []);

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
        const promotersResponse = await locationApi.getAuthorizedPromoters(data.location._id);
        if (promotersResponse.success) {
          setData(prev => ({
            ...prev,
            authorizedPromoters: (promotersResponse.data || []).map((user: { _id: string; firstName: string; lastName: string; email: string }) => ({
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
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchCurrentUserLocation();
    } else {
      setData({
        location: null,
        gigs: [],
        authorizedPromoters: [],
        loading: false,
        error: 'Please log in to access the location dashboard.',
      });
    }
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
