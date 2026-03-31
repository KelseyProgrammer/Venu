"use client"

import { memo, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Star } from "lucide-react"
import Image from "next/image"
import { getLocationDisplayName } from "@/lib/location-data"
import { calculateEventBonusTiers } from "@/lib/bonus-tiers"
import type { Gig } from "./types"

interface GigCardProps {
  gig: Gig
  gigBonusTiers: Record<number, ReturnType<typeof calculateEventBonusTiers>>
  onSelectGig: (gigId: string) => void
  onBookGig: (gigId: string, gigData: Record<string, unknown>) => Promise<void>
}

export const GigCard = memo(function GigCard({
  gig,
  gigBonusTiers,
  onSelectGig,
  onBookGig,
}: GigCardProps) {
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const progress = useMemo(
    () => (gig.ticketsSold / gig.totalTickets) * 100,
    [gig.ticketsSold, gig.totalTickets]
  )

  const bandTiers = useMemo(() => {
    if (!gig.bands || !gigBonusTiers[gig.id]) return []
    return gig.bands
      .map((band) => {
        const tiers = gigBonusTiers[gig.id]?.find((bt) => bt.bandId === band.id)
        return tiers ? { band, bandTiers: tiers } : null
      })
      .filter(
        (
          item
        ): item is {
          band: (typeof gig.bands)[0]
          bandTiers: NonNullable<(typeof gigBonusTiers)[number][0]>
        } => item !== null
      )
  }, [gig, gigBonusTiers])

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex gap-4">
        <div className="relative">
          <Image
            src={gig.image || "/images/venu-logo.png"}
            alt={gig.location}
            width={80}
            height={80}
            className="rounded-lg object-cover w-20 h-20"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
          <div className="absolute -top-1 -right-1">
            <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
              {gig.genre}
            </Badge>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">{getLocationDisplayName(gig.location)}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {gig.date} - {gig.time}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {gig.rating}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">
              Payout Tiers (${gig.ticketPrice}/ticket)
            </div>

            {bandTiers.length > 0 ? (
              bandTiers.map(({ band, bandTiers: tiers }) => (
                <div key={band.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {band.name} ({band.percentage}%)
                    </span>
                    <span className="text-foreground font-medium">${tiers.currentEarnings}</span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Guarantee: ${band.guarantee}</span>
                      <span>Current: ${Math.round(tiers.currentEarnings)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tiers.tiers.slice(1).map((tier, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs">
                        <div className={`w-2 h-2 rounded-full ${tier.color}`} />
                        <span>
                          {tier.threshold}+ tickets = ${tier.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No bands configured for this event</div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-transparent"
              onClick={() => onSelectGig(gig.id.toString())}
            >
              See Checklist
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={applied || applying}
              onClick={async () => {
                setApplying(true)
                await onBookGig(gig.id.toString(), {})
                setApplying(false)
                setApplied(true)
              }}
            >
              {applied ? "Applied!" : applying ? "Applying..." : "Book Now"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
})
