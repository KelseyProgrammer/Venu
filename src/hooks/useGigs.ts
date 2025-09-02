import { useState, useEffect, useCallback } from 'react'
import { gigApi } from '@/lib/api'

export interface Gig {
  _id: string
  eventName: string
  eventDate: string
  eventTime: string
  eventGenre: string
  ticketCapacity: number
  ticketPrice: number
  selectedLocation?: {
    _id: string
    name: string
    city: string
    state: string
    address?: string
  }
  selectedPromoter?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  bands: Array<{
    name: string
    genre: string
    setTime: string
    percentage: number
    email: string
  }>
  status: 'draft' | 'posted' | 'live' | 'completed'
  rating: number
  tags: string[]
  ticketsSold: number
  image: string
  createdBy: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export function useGigs() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGigs = useCallback(async (params?: {
    page?: number
    limit?: number
    status?: string
    genre?: string
    location?: string
  }) => {
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
      } else {
        setError(response.error || 'Failed to fetch gigs')
      }
    } catch (err) {
      console.error('Error fetching gigs:', err)
      setError('Failed to fetch gigs')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshGigs = useCallback(() => {
    fetchGigs()
  }, [fetchGigs])

  useEffect(() => {
    fetchGigs()
  }, [fetchGigs])

  return {
    gigs,
    loading,
    error,
    fetchGigs,
    refreshGigs
  }
}
