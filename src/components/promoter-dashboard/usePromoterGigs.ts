"use client"

import { useCallback, useEffect, useState } from "react"
import { gigApi, GigProfile } from "@/lib/api"
import { authUtils } from "@/lib/utils"

export interface AssignedLocation {
  _id: string;
  name: string;
  city: string;
  state: string;
  capacity: number;
}

export function gigLocationId(gig: GigProfile): string | undefined {
  const loc = gig.selectedLocation as unknown
  if (!loc) return undefined
  if (typeof loc === "string") return loc
  return (loc as { _id?: string })._id
}

/**
 * Gigs relevant to the signed-in promoter: everything at their assigned
 * locations plus gigs they created themselves, deduplicated by id.
 */
export function usePromoterGigs(locations: AssignedLocation[]) {
  const [gigs, setGigs] = useState<GigProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentUserId = authUtils.getCurrentUser()?.id

  const fetchGigs = useCallback(async () => {
    const requests: Promise<{ success: boolean; data?: GigProfile[] }>[] = locations.map(loc =>
      gigApi.getGigsByLocation(loc._id, 1, 100)
    )
    if (currentUserId) {
      requests.push(gigApi.getGigsByCreator(currentUserId, 1, 100))
    }
    const results = await Promise.all(requests)

    const byId = new Map<string, GigProfile>()
    for (const res of results) {
      if (res.success && res.data) {
        for (const gig of res.data) {
          byId.set(gig._id, gig)
        }
      }
    }
    return Array.from(byId.values())
  }, [locations, currentUserId])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchGigs()
      .then(result => { if (!cancelled) setGigs(result) })
      .catch(() => { if (!cancelled) setGigs([]) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [fetchGigs])

  const refresh = useCallback(() => {
    fetchGigs().then(setGigs).catch(() => {})
  }, [fetchGigs])

  return { gigs, isLoading, refresh }
}
