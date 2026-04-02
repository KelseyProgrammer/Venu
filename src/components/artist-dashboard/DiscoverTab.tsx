"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { OpenGigCard } from "./OpenGigCard"
import type { GigProfile } from "@/lib/api"

interface DiscoverTabProps {
  openGigs: GigProfile[]
  openGigsLoading: boolean
  openGigsError: string | null
  onApply: (gigId: string) => Promise<{ success: boolean; error?: string }>
}

export const DiscoverTab = memo(function DiscoverTab({
  openGigs,
  openGigsLoading,
  openGigsError,
  onApply,
}: DiscoverTabProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Open Gigs</h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {openGigsLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading gigs...
          </div>
        ) : openGigsError ? (
          <div className="text-center py-8 text-red-600">
            Error loading gigs: {openGigsError}
          </div>
        ) : openGigs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No open gigs right now.</p>
            <p className="text-xs mt-1 opacity-70">Check back soon — when venues post gigs with open slots they&apos;ll appear here.</p>
          </div>
        ) : (
          openGigs.map((gig) => (
            <OpenGigCard key={gig._id} gig={gig} onApply={onApply} />
          ))
        )}
      </div>
    </div>
  )
})
