"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText } from "lucide-react"
import { GigProfile } from "@/lib/api"

interface ApplicationsTabProps {
  gigs: GigProfile[];
}

export function ApplicationsTab({ gigs }: ApplicationsTabProps) {
  const pendingGigs = useMemo(() =>
    gigs.filter(g => g.status === "pending-confirmation" || g.status === "posted"),
    [gigs]
  )

  const statusBadge = (status: string) => {
    if (status === "pending-confirmation") {
      return <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">Awaiting Confirmation</Badge>
    }
    if (status === "posted") {
      return <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">Posted</Badge>
    }
    return <Badge variant="outline" className="text-xs">{status}</Badge>
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="font-serif font-bold text-xl">Gig Applications</h2>

      {pendingGigs.length === 0 ? (
        <Card className="p-8 text-center bg-card border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No pending applications</h3>
          <p className="text-sm text-muted-foreground">
            Gigs pending artist confirmation or awaiting review will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingGigs.map((gig) => {
            const confirmedBands = gig.bands?.filter(b => b.confirmed).length ?? 0
            const totalBands = gig.bands?.length ?? 0

            return (
              <Card key={gig._id} className="p-4 bg-card border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{gig.eventName}</h3>
                      {statusBadge(gig.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(gig.eventDate).toLocaleDateString()}
                      </span>
                      {totalBands > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {confirmedBands}/{totalBands} artists confirmed
                        </span>
                      )}
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
}
