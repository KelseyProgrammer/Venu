"use client"

import { memo, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Building2 } from "lucide-react"
import { GigProfile } from "@/lib/api"

interface ApplicationsTabProps {
  totalUpdates: number
  gigs: GigProfile[]
}

export const ApplicationsTab = memo(function ApplicationsTab({ totalUpdates, gigs }: ApplicationsTabProps) {
  const sorted = useMemo(() =>
    [...gigs].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()),
    [gigs]
  )

  const statusBadge = (status: string, confirmed?: boolean) => {
    if (status === "pending-confirmation" && !confirmed) {
      return <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">Awaiting Your Response</Badge>
    }
    if (status === "pending-confirmation" && confirmed) {
      return <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">Lineup Filling</Badge>
    }
    if (status === "posted") {
      return <Badge variant="default" className="text-xs bg-green-600">Confirmed</Badge>
    }
    if (status === "completed") {
      return <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">Completed</Badge>
    }
    if (status === "live") {
      return <Badge variant="default" className="text-xs bg-red-600">Live Now</Badge>
    }
    return <Badge variant="outline" className="text-xs">{status}</Badge>
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">My Applications</h2>
        {totalUpdates > 0 && (
          <Badge variant="default" className="bg-purple-600 text-white">
            {totalUpdates} new update{totalUpdates !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {sorted.length === 0 ? (
        <Card className="p-8 text-center bg-card border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No applications yet</h3>
          <p className="text-sm text-muted-foreground">
            Gigs you&apos;ve been invited to or confirmed for will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((gig) => {
            const location = typeof gig.selectedLocation === "object" && gig.selectedLocation !== null
              ? (gig.selectedLocation as { name?: string }).name
              : undefined
            const myBand = gig.bands?.find(b => b.confirmed !== undefined)

            return (
              <Card key={gig._id} className="p-4 bg-card border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{gig.eventName}</h3>
                      {statusBadge(gig.status, myBand?.confirmed)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {location && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(gig.eventDate).toLocaleDateString()} · {gig.eventTime}
                      </span>
                    </div>
                    {gig.eventGenre && (
                      <Badge variant="outline" className="text-xs mt-1">{gig.eventGenre}</Badge>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
})
