// API utility functions for Venu app

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  _id: string;
  id?: string; // For backward compatibility
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ArtistProfile {
  _id: string;
  name: string;
  bio: string;
  genre: string[];
  profileImage: string;
  email: string;
  phone?: string;
  instagram?: string;
  spotify?: string;
  appleMusic?: string;
  website?: string;
  youtube?: string;
  tiktok?: string;
  location: string;
  availability: string;
  priceRange: string;
  setLength?: string;
  equipmentNeeds?: string;
  pricing?: string;
  typicalSetlist?: string;
  soundRequirements?: string;
  pastPerformances?: string;
  reviews?: string;
  rating: number;
  portfolioImages?: string[];
  portfolioVideos?: string[];
  unavailableDates?: Date[];
  preferredBookingDays?: string[];
  bookingLeadTime?: string;
  cancellationPolicy?: string;
  followers: string;
  totalGigs: number;
  totalEarnings: number;
  userId: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationProfile {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  capacity: number;
  description?: string;
  amenities: string[];
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  images: string[];
  rating: number;
  tags: string[];
  isActive: boolean;
  createdBy: string;
  authorizedPromoters: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PromoterProfile {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  companyName?: string;
  businessDescription?: string;
  yearsOfExperience?: number;
  specialties: string[];
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  portfolioImages: string[];
  pastEvents?: string;
  testimonials?: string;
  businessHours?: string;
  serviceAreas: string[];
  pricingStructure?: string;
  bookingPolicies?: string;
  references?: string;
  certifications: string[];
  userId: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FanProfile {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  favoriteGenres: string[];
  favoriteArtists: string[];
  favoriteVenues: string[];
  notificationPreferences: string[];
  instagram?: string;
  facebook?: string;
  twitter?: string;
  bio?: string;
  age?: number;
  interests: string[];
  eventHistory?: string;
  userId: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GigProfile {
  _id: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventGenre: string;
  ticketCapacity: number;
  ticketPrice: number;
  selectedLocation?: LocationProfile;
  selectedPromoter?: User;
  promoterEmail?: string;
  promoterPercentage?: number;
  selectedDoorPerson?: User;
  doorPersonEmail: string;
  requirements: Array<{
    text: string;
    checked: boolean;
  }>;
  bands: Array<{
    name: string;
    genre: string;
    setTime: string;
    percentage: number;
    email: string;
  }>;
  guarantee: number;
  numberOfBands: number;
  status: 'draft' | 'posted' | 'live' | 'completed';
  rating: number;
  tags: string[];
  ticketsSold: number;
  image: string;
  bonusTiers: {
    tier1: { amount: number; threshold: number; color: string };
    tier2: { amount: number; threshold: number; color: string };
    tier3: { amount: number; threshold: number; color: string };
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Generic API request function with enhanced error handling and performance
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {};

  // Add authorization header if token exists
  const token = localStorage.getItem('authToken');
  if (token) {
    // Basic validation - if token looks invalid, clear it
    if (token.length < 10 || !token.includes('.')) {
      console.log('🔐 Invalid token format detected, clearing...');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
    } else {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    let data: unknown;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }

    if (!response.ok) {
      // Handle authentication errors by clearing invalid tokens
      if (response.status === 401 || response.status === 403) {
        const errorMessage = (data as { error?: string; message?: string }).error || (data as { error?: string; message?: string }).message || `Request failed with status ${response.status}`;
        
        // Clear invalid authentication data
        if (errorMessage.includes('Access token') || 
            errorMessage.includes('Unauthorized') || 
            errorMessage.includes('Invalid token') ||
            errorMessage.includes('User not found')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          console.log('🔐 Cleared invalid authentication data');
        }
      }
      
      // Return the error response instead of throwing for client errors
      return {
        success: false,
        error: (data as { error?: string; message?: string }).error || (data as { error?: string; message?: string }).message || `Request failed with status ${response.status}`,
        data: undefined as T
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API request failed:', error);
    
    // Handle different types of errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error - please check your connection',
        data: undefined as T
      };
    }
    
    // For other errors, still throw to maintain existing behavior
    throw error;
  }
}

// Auth API functions
export const authApi = {
  async register(userData: {
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return apiRequest<User>('/auth/profile');
  },

  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImage?: string;
  }): Promise<ApiResponse<User>> {
    return apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async updateProfileImage(profileImage: string): Promise<ApiResponse<User>> {
    return apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ profileImage }),
    });
  },
};

// Artist API functions
export const artistApi = {
  async createArtist(profileData: {
    name: string;
    bio: string;
    genre: string[];
    profileImage?: string;
    email: string;
    phone?: string;
    instagram?: string;
    spotify?: string;
    appleMusic?: string;
    website?: string;
    youtube?: string;
    tiktok?: string;
    location: string;
    availability: string;
    priceRange: string;
    setLength?: string;
    equipmentNeeds?: string;
    pricing?: string;
    typicalSetlist?: string;
    soundRequirements?: string;
    pastPerformances?: string;
    reviews?: string;
    rating?: number;
    portfolioImages?: string[];
    portfolioVideos?: string[];
    unavailableDates?: Date[];
    preferredBookingDays?: string[];
    bookingLeadTime?: string;
    cancellationPolicy?: string;
  }): Promise<ApiResponse<ArtistProfile>> {
    return apiRequest<ArtistProfile>('/artists', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  async getArtist(artistId: string): Promise<ApiResponse<ArtistProfile>> {
    return apiRequest<ArtistProfile>(`/artists/${artistId}`);
  },

  async getArtistByUserId(userId: string): Promise<ApiResponse<ArtistProfile>> {
    return apiRequest<ArtistProfile>(`/artists/user/${userId}`);
  },

  async updateArtist(
    artistId: string,
    profileData: Partial<ArtistProfile>
  ): Promise<ApiResponse<ArtistProfile>> {
    return apiRequest<ArtistProfile>(`/artists/${artistId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async deleteArtist(artistId: string): Promise<ApiResponse<null>> {
    return apiRequest<null>(`/artists/${artistId}`, {
      method: 'DELETE',
    });
  },

  async getAllArtists(params?: {
    page?: number;
    limit?: number;
    genre?: string;
    location?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<ArtistProfile[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/artists?${queryString}` : '/artists';
    
    return apiRequest<ArtistProfile[]>(endpoint);
  },

  async searchArtists(query: string, page = 1, limit = 10): Promise<ApiResponse<ArtistProfile[]>> {
    return apiRequest<ArtistProfile[]>(`/artists/search/${encodeURIComponent(query)}?page=${page}&limit=${limit}`);
  },

  async getArtistsByGenre(genre: string, page = 1, limit = 10): Promise<ApiResponse<ArtistProfile[]>> {
    return apiRequest<ArtistProfile[]>(`/artists/by-genre/${encodeURIComponent(genre)}?page=${page}&limit=${limit}`);
  },

  async getArtistsByLocation(location: string, page = 1, limit = 10): Promise<ApiResponse<ArtistProfile[]>> {
    return apiRequest<ArtistProfile[]>(`/artists/by-location/${encodeURIComponent(location)}?page=${page}&limit=${limit}`);
  },

  // Legacy function names for backward compatibility
  async createProfile(profileData: any): Promise<ApiResponse<ArtistProfile>> {
    return this.createArtist(profileData);
  },

  async getProfile(artistId: string): Promise<ApiResponse<ArtistProfile>> {
    return this.getArtist(artistId);
  },

  async getProfileByUserId(userId: string): Promise<ApiResponse<ArtistProfile>> {
    return this.getArtistByUserId(userId);
  },

  async updateProfile(artistId: string, profileData: any): Promise<ApiResponse<ArtistProfile>> {
    return this.updateArtist(artistId, profileData);
  },

  async deleteProfile(artistId: string): Promise<ApiResponse<null>> {
    return this.deleteArtist(artistId);
  },

  // Favorite count methods
  async getFavoriteCounts(): Promise<ApiResponse<Array<{ artistId: string; artistName: string; fanCount: number }>>> {
    return apiRequest<Array<{ artistId: string; artistName: string; fanCount: number }>>('/artists/favorites/count');
  },

  async getArtistFavoriteCount(artistId: string): Promise<ApiResponse<{ artistId: string; fanCount: number }>> {
    return apiRequest<{ artistId: string; fanCount: number }>(`/artists/${artistId}/favorites/count`);
  },
};

// Upload API functions
export const uploadApi = {
  async uploadImage(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    
    return apiRequest<{ url: string; filename: string }>('/upload/image', {
      method: 'POST',
      body: formData,
    });
  },
};

// Location API functions
export const locationApi = {
  async getAllLocations(params?: {
    page?: number;
    limit?: number;
    city?: string;
    state?: string;
    capacity?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<LocationProfile[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/locations?${queryString}` : '/locations';
    
    return apiRequest<LocationProfile[]>(endpoint);
  },

  async getLocationById(locationId: string): Promise<ApiResponse<LocationProfile>> {
    return apiRequest<LocationProfile>(`/locations/${locationId}`);
  },

  async getLocationByUserId(userId: string): Promise<ApiResponse<LocationProfile>> {
    return apiRequest<LocationProfile>(`/locations/user/${userId}`);
  },

  async searchLocationsByArea(params: {
    city?: string;
    state?: string;
    radius?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<LocationProfile[]>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/locations/search/area?${queryString}` : '/locations/search/area';
    
    return apiRequest<LocationProfile[]>(endpoint);
  },

  async searchLocationsByCapacity(params: {
    minCapacity?: number;
    maxCapacity?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<LocationProfile[]>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/locations/search/capacity?${queryString}` : '/locations/search/capacity';
    
    return apiRequest<LocationProfile[]>(endpoint);
  },

  async createLocation(locationData: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    capacity: number;
    description?: string;
    amenities?: string[];
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    images?: string[];
    tags?: string[];
  }): Promise<ApiResponse<LocationProfile>> {
    return apiRequest<LocationProfile>('/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  },

  async updateLocation(locationId: string, locationData: Partial<LocationProfile>): Promise<ApiResponse<LocationProfile>> {
    return apiRequest<LocationProfile>(`/locations/${locationId}`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  },

  async deleteLocation(locationId: string): Promise<ApiResponse<null>> {
    return apiRequest<null>(`/locations/${locationId}`, {
      method: 'DELETE',
    });
  },

  async addPromoterToLocation(locationId: string, promoterId: string): Promise<ApiResponse<LocationProfile>> {
    return apiRequest<LocationProfile>(`/locations/${locationId}/promoters`, {
      method: 'POST',
      body: JSON.stringify({ promoterId }),
    });
  },

  async removePromoterFromLocation(locationId: string, promoterId: string): Promise<ApiResponse<LocationProfile>> {
    return apiRequest<LocationProfile>(`/locations/${locationId}/promoters/${promoterId}`, {
      method: 'DELETE',
    });
  },

  async getAuthorizedPromoters(locationId: string): Promise<ApiResponse<User[]>> {
    return apiRequest<User[]>(`/locations/${locationId}/promoters`);
  },
};

// Gig API functions
export const gigApi = {
  async getAllGigs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    genre?: string;
    location?: string;
    promoter?: string;
  }): Promise<ApiResponse<GigProfile[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/gigs?${queryString}` : '/gigs';
    
    return apiRequest<GigProfile[]>(endpoint);
  },

  async getGigById(gigId: string): Promise<ApiResponse<GigProfile>> {
    return apiRequest<GigProfile>(`/gigs/${gigId}`);
  },

  async getGigsByStatus(status: string, page = 1, limit = 10): Promise<ApiResponse<GigProfile[]>> {
    return apiRequest<GigProfile[]>(`/gigs/by-status/${encodeURIComponent(status)}?page=${page}&limit=${limit}`);
  },

  async getGigsByCreator(userId: string, page = 1, limit = 10): Promise<ApiResponse<GigProfile[]>> {
    return apiRequest<GigProfile[]>(`/gigs/by-creator/${encodeURIComponent(userId)}?page=${page}&limit=${limit}`);
  },

  async getGigsByLocation(locationId: string, page = 1, limit = 10): Promise<ApiResponse<GigProfile[]>> {
    return apiRequest<GigProfile[]>(`/gigs?location=${encodeURIComponent(locationId)}&page=${page}&limit=${limit}`);
  },

  async getGigsByArtist(email: string, page = 1, limit = 10): Promise<ApiResponse<GigProfile[]>> {
    return apiRequest<GigProfile[]>(`/gigs/by-artist/${encodeURIComponent(email)}?page=${page}&limit=${limit}`);
  },

  async createGig(gigData: {
    eventName: string;
    eventDate: string;
    eventTime: string;
    eventGenre: string;
    ticketCapacity: number;
    ticketPrice: number;
    selectedLocation?: string;
    selectedPromoter?: string;
    promoterEmail?: string;
    promoterPercentage?: number;
    selectedDoorPerson?: string;
    doorPersonEmail: string;
    requirements?: Array<{ text: string; checked: boolean }>;
    bands?: Array<{
      name: string;
      genre: string;
      setTime: string;
      percentage: number;
      email: string;
    }>;
    guarantee: number;
    numberOfBands: number;
    tags?: string[];
    image?: string;
    bonusTiers?: {
      tier1: { amount: number; threshold: number; color: string };
      tier2: { amount: number; threshold: number; color: string };
      tier3: { amount: number; threshold: number; color: string };
    };
  }): Promise<ApiResponse<GigProfile>> {
    return apiRequest<GigProfile>('/gigs', {
      method: 'POST',
      body: JSON.stringify(gigData),
    });
  },

  async updateGig(gigId: string, gigData: Partial<GigProfile>): Promise<ApiResponse<GigProfile>> {
    return apiRequest<GigProfile>(`/gigs/${gigId}`, {
      method: 'PUT',
      body: JSON.stringify(gigData),
    });
  },

  async deleteGig(gigId: string): Promise<ApiResponse<null>> {
    return apiRequest<null>(`/gigs/${gigId}`, {
      method: 'DELETE',
    });
  },
};

// Promoter API functions
export const promoterApi = {
  async getAllPromoters(params?: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    specialty?: string;
  }): Promise<ApiResponse<PromoterProfile[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.specialty) searchParams.append('specialty', params.specialty);
    
    return apiRequest<PromoterProfile[]>(`/promoters?${searchParams.toString()}`);
  },

  async getPromoterById(promoterId: string): Promise<ApiResponse<PromoterProfile>> {
    return apiRequest<PromoterProfile>(`/promoters/${promoterId}`);
  },

  async getPromoterByUserId(userId: string): Promise<ApiResponse<PromoterProfile>> {
    return apiRequest<PromoterProfile>(`/promoters/user/${userId}`);
  },

  async createPromoter(promoterData: Partial<PromoterProfile>): Promise<ApiResponse<PromoterProfile>> {
    return apiRequest<PromoterProfile>('/promoters', {
      method: 'POST',
      body: JSON.stringify(promoterData),
    });
  },

  async updatePromoter(promoterId: string, promoterData: Partial<PromoterProfile>): Promise<ApiResponse<PromoterProfile>> {
    return apiRequest<PromoterProfile>(`/promoters/${promoterId}`, {
      method: 'PUT',
      body: JSON.stringify(promoterData),
    });
  },

  async deletePromoter(promoterId: string): Promise<ApiResponse<null>> {
    return apiRequest<null>(`/promoters/${promoterId}`, {
      method: 'DELETE',
    });
  },

  async searchPromoters(query: string): Promise<ApiResponse<PromoterProfile[]>> {
    return apiRequest<PromoterProfile[]>(`/promoters/search/${encodeURIComponent(query)}`);
  },

  async getPromotersBySpecialty(specialty: string): Promise<ApiResponse<PromoterProfile[]>> {
    return apiRequest<PromoterProfile[]>(`/promoters/specialty/${encodeURIComponent(specialty)}`);
  },

  async getPromotersByLocation(location: string): Promise<ApiResponse<PromoterProfile[]>> {
    return apiRequest<PromoterProfile[]>(`/promoters/location/${encodeURIComponent(location)}`);
  },
};

// Fan API functions
export const fanApi = {
  async getAllFans(params?: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    genre?: string;
  }): Promise<ApiResponse<FanProfile[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.genre) searchParams.append('genre', params.genre);
    
    return apiRequest<FanProfile[]>(`/fans?${searchParams.toString()}`);
  },

  async getFanById(fanId: string): Promise<ApiResponse<FanProfile>> {
    return apiRequest<FanProfile>(`/fans/${fanId}`);
  },

  async getFanByUserId(userId: string): Promise<ApiResponse<FanProfile>> {
    return apiRequest<FanProfile>(`/fans/user/${userId}`);
  },

  async createFan(fanData: Partial<FanProfile>): Promise<ApiResponse<FanProfile>> {
    return apiRequest<FanProfile>('/fans', {
      method: 'POST',
      body: JSON.stringify(fanData),
    });
  },

  async updateFan(fanId: string, fanData: Partial<FanProfile>): Promise<ApiResponse<FanProfile>> {
    return apiRequest<FanProfile>(`/fans/${fanId}`, {
      method: 'PUT',
      body: JSON.stringify(fanData),
    });
  },

  async deleteFan(fanId: string): Promise<ApiResponse<null>> {
    return apiRequest<null>(`/fans/${fanId}`, {
      method: 'DELETE',
    });
  },

  async searchFans(query: string): Promise<ApiResponse<FanProfile[]>> {
    return apiRequest<FanProfile[]>(`/fans/search/${encodeURIComponent(query)}`);
  },

  async getFansByGenre(genre: string): Promise<ApiResponse<FanProfile[]>> {
    return apiRequest<FanProfile[]>(`/fans/genre/${encodeURIComponent(genre)}`);
  },

  async getFansByLocation(location: string): Promise<ApiResponse<FanProfile[]>> {
    return apiRequest<FanProfile[]>(`/fans/location/${encodeURIComponent(location)}`);
  },
};

// Utility functions with enhanced validation and error handling
export const apiUtils = {
  setAuthToken(token: string): void {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token provided');
    }
    localStorage.setItem('authToken', token);
  },

  getAuthToken(): string | null {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.warn('Failed to get auth token from localStorage:', error);
      return null;
    }
  },

  removeAuthToken(): void {
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.warn('Failed to remove auth token from localStorage:', error);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  },

  // Input validation utilities
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  },

  // Pagination validation
  validatePaginationParams(params: { page?: number; limit?: number }): { page: number; limit: number } {
    const page = Math.max(1, Math.floor(params.page || 1));
    const limit = Math.min(100, Math.max(1, Math.floor(params.limit || 10)));
    return { page, limit };
  }
};
