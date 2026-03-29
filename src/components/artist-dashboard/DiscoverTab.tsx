"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { calculateEventBonusTiers } from "@/lib/bonus-tiers"
import { GigCard } from "./GigCard"
import type { Gig } from "./types"

interface DiscoverTabProps {
  transformedGigs: Gig[]
  gigBonusTiers: Record<number, ReturnType<typeof calculateEventBonusTiers>>
  gigsLoading: boolean
  gigsError: string | null
  newGigsCount: number
  onSelectGig: (gigId: string) => void
  onBookGig: (gigId: string, gigData: Record<string, unknown>) => void
}

export const DiscoverTab = memo(function DiscoverTab({
  transformedGigs,
  gigBonusTiers,
  gigsLoading,
  gigsError,
  newGigsCount,
  onSelectGig,
  onBookGig,
}: DiscoverTabProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Trending locations near you</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            Filter
          </Button>
          {newGigsCount > 0 && (
            <Badge variant="default" className="bg-orange-600 text-white">
              {newGigsCount} new gig{newGigsCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {gigsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading gigs...</div>
          </div>
        ) : gigsError ? (
          <div className="text-center py-8">
            <div className="text-red-600">Error loading gigs: {gigsError}</div>
          </div>
        ) : transformedGigs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              No gigs found. When locations post gigs with your email, they&apos;ll appear here.
            </div>
          </div>
        ) : (
          transformedGigs.map((gig) => (
            <GigCard
              key={gig.id}
              gig={gig}
              gigBonusTiers={gigBonusTiers}
              onSelectGig={onSelectGig}
              onBookGig={onBookGig}
            />
          ))
        )}
      </div>
    </div>
  )
})
