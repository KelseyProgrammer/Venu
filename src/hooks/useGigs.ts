import { useState, useEffect, useCallback, useMemo } from 'react'
import { gigApi, GigProfile } from '@/lib/api'

// Re-export the GigProfile interface for consistency
export type Gig = GigProfile

interface UseGigsParams {
  page?: number
  limit?: number
  status?: string
  genre?: string
  location?: string
}

interface UseGigsReturn {
  gigs: Gig[]
  loading: boolean
  error: string | null
  fetchGigs: (params?: UseGigsParams) => Promise<void>
  refreshGigs: () => Promise<void>
  hasMore: boolean
  totalPages: number
}

export function useGigs(): UseGigsReturn {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    totalPages: number
    hasMore: boolean
  }>({
    page: 1,
    totalPages: 1,
    hasMore: false
  })

  const fetchGigs = useCallback(async (params?: UseGigsParams) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await gigApi.getAllGigs({
        ...params,
        status: params?.status || 'posted', // Only fetch posted gigs by default
        limit: params?.limit || 50 // Get more gigs for better display
      })

      if (response.success && response.data) {
        setGigs(response.data)
        
        // Update pagination info if available
        if (response.pagination) {
          setPagination({
            page: response.pagination.page,
            totalPages: response.pagination.totalPages,
            hasMore: response.pagination.page < response.pagination.totalPages
          })
        }
      } else {
        setError(response.error || 'Failed to fetch gigs')
      }
    } catch (err) {
      console.error('Error fetching gigs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch gigs')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshGigs = useCallback(async () => {
    await fetchGigs()
  }, [fetchGigs])

  // Memoized return object to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    gigs,
    loading,
    error,
    fetchGigs,
    refreshGigs,
    hasMore: pagination.hasMore,
    totalPages: pagination.totalPages
  }), [gigs, loading, error, fetchGigs, refreshGigs, pagination.hasMore, pagination.totalPages])

  useEffect(() => {
    // Only fetch if we have a valid token
    const token = localStorage.getItem('authToken');
    if (token && token.length >= 10 && token.includes('.')) {
      fetchGigs();
    } else {
      // Clear invalid token if it exists
      if (token) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
      setLoading(false);
      setError('Please log in to view gigs');
    }
  }, [fetchGigs])

  return returnValue
}

