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
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isVerified: boolean;
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
  location: string;
  availability: string;
  priceRange: string;
  rating: number;
  followers: string;
  totalGigs: number;
  totalEarnings: number;
  userId: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
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
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
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
};

// Artist API functions
export const artistApi = {
  async createProfile(profileData: {
    name: string;
    bio: string;
    genre: string[];
    profileImage?: string;
    email?: string;
    phone?: string;
    instagram?: string;
    spotify?: string;
    appleMusic?: string;
    website?: string;
    location: string;
    availability: string;
    priceRange: string;
  }): Promise<ApiResponse<ArtistProfile>> {
    return apiRequest<ArtistProfile>('/artists', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  async getProfile(artistId: string): Promise<ApiResponse<ArtistProfile>> {
    return apiRequest<ArtistProfile>(`/artists/${artistId}`);
  },

  async getProfileByUserId(userId: string): Promise<ApiResponse<ArtistProfile>> {
    return apiRequest<ArtistProfile>(`/artists/user/${userId}`);
  },

  async updateProfile(
    artistId: string,
    profileData: Partial<ArtistProfile>
  ): Promise<ApiResponse<ArtistProfile>> {
    return apiRequest<ArtistProfile>(`/artists/${artistId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async deleteProfile(artistId: string): Promise<ApiResponse<null>> {
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
};

// Utility functions
export const apiUtils = {
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  },

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  },

  removeAuthToken(): void {
    localStorage.removeItem('authToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  },
};
