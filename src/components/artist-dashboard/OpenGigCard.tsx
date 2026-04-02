"use client"

import { memo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Music, Users } from "lucide-react"
import type { GigProfile } from "@/lib/api"

interface OpenGigCardProps {
  gig: GigProfile
  onApply: (gigId: string) => Promise<{ success: boolean; error?: string }>
}

export const OpenGigCard = memo(function OpenGigCard({ gig, onApply }: OpenGigCardProps) {
  const [state, setState] = useState<"idle" | "applying" | "applied" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const openSlots = gig.numberOfBands - gig.bands.filter(b => b.confirmed).length
  const dateStr = new Date(gig.eventDate).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  })

  async function handleApply() {
    setState("applying")
    const res = await onApply(gig._id)
    if (res.success) {
      setState("applied")
    } else {
      setErrorMsg(res.error || "Could not apply")
      setState("error")
    }
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground">{gig.eventName}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {gig.selectedLocation?.name || "Venue TBA"}
              {gig.selectedLocation?.city ? `, ${gig.selectedLocation.city}` : ""}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">{gig.eventGenre}</Badge>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {dateStr}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {gig.eventTime || "Time TBA"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {openSlots} open slot{openSlots !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Music className="w-3.5 h-3.5" />
            ${gig.ticketPrice}/ticket
          </span>
        </div>

        {state === "error" && (
          <p className="text-xs text-red-500">{errorMsg}</p>
        )}

        <div className="flex justify-end">
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={state !== "idle"}
            onClick={handleApply}
          >
            {state === "applying" ? "Applying..." : state === "applied" ? "Applied!" : "Apply to Play"}
          </Button>
        </div>
      </div>
    </Card>
  )
})
