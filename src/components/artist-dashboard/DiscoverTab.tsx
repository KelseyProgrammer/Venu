"use client"

import { memo, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { OpenGigCard } from "./OpenGigCard"
import type { GigProfile } from "@/lib/api"

const GENRES = ["jazz", "rock", "electronic", "folk", "blues", "pop", "country", "hip-hop", "classical", "reggae"]

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
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!selectedGenre) return openGigs
    return openGigs.filter(g => g.eventGenre?.toLowerCase() === selectedGenre)
  }, [openGigs, selectedGenre])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Open Gigs</h2>
        {selectedGenre && (
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setSelectedGenre(null)}>
            Clear filter
          </Button>
        )}
      </div>

      {/* Genre filter pills */}
      <div className="flex flex-wrap gap-2">
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => setSelectedGenre(prev => prev === g ? null : g)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedGenre === g
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-transparent border-border text-muted-foreground hover:border-purple-400 hover:text-foreground"
            }`}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">{selectedGenre ? `No open ${selectedGenre} gigs right now.` : "No open gigs right now."}</p>
            <p className="text-xs mt-1 opacity-70">Check back soon — venues post gigs with open slots here.</p>
          </div>
        ) : (
          filtered.map((gig) => (
            <OpenGigCard key={gig._id} gig={gig} onApply={onApply} />
          ))
        )}
      </div>
    </div>
  )
})
