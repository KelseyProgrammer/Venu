"use client"

import { useState, useMemo, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, FileText, CheckCircle, X, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { GigProfile, gigApi } from "@/lib/api"

interface ApplicationsTabProps {
  gigs: GigProfile[];
  onRefresh: () => void;
}

export function ApplicationsTab({ gigs, onRefresh }: ApplicationsTabProps) {
  const [expandedGig, setExpandedGig] = useState<string | null>(null)
  const [pending, setPending] = useState<Record<string, boolean>>({})

  const pendingGigs = useMemo(() =>
    gigs.filter(g =>
      (g.status === "pending-confirmation" || g.status === "posted") &&
      g.bands?.some(b => !b.confirmed)
    ),
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

  const handleAccept = useCallback(async (gigId: string, bandEmail: string) => {
    const key = `${gigId}:${bandEmail}:accept`
    setPending(p => ({ ...p, [key]: true }))
    try {
      await gigApi.confirmBand(gigId, { bandEmail, confirmed: true })
      onRefresh()
    } finally {
      setPending(p => ({ ...p, [key]: false }))
    }
  }, [onRefresh])

  const handleRemove = useCallback(async (gigId: string, bandEmail: string) => {
    const key = `${gigId}:${bandEmail}:remove`
    setPending(p => ({ ...p, [key]: true }))
    try {
      await gigApi.removeBand(gigId, bandEmail)
      onRefresh()
    } finally {
      setPending(p => ({ ...p, [key]: false }))
    }
  }, [onRefresh])

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
            const isExpanded = expandedGig === gig._id

            return (
              <Card key={gig._id} className="bg-card border-border overflow-hidden">
                {/* Gig header row */}
                <button
                  className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedGig(isExpanded ? null : gig._id)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
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
                          {confirmedBands}/{totalBands} confirmed
                        </span>
                      )}
                    </div>
                    {gig.eventGenre && (
                      <Badge variant="outline" className="text-xs mt-1">{gig.eventGenre}</Badge>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                  )}
                </button>

                {/* Band list (expanded) */}
                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border">
                    {!gig.bands || gig.bands.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">No artists in lineup yet.</p>
                    ) : (
                      gig.bands.map((band) => {
                        const acceptKey = `${gig._id}:${band.email}:accept`
                        const removeKey = `${gig._id}:${band.email}:remove`
                        const isAccepting = !!pending[acceptKey]
                        const isRemoving = !!pending[removeKey]
                        const isBusy = isAccepting || isRemoving

                        return (
                          <div key={band.email} className="p-4 flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground text-sm">{band.name}</span>
                                {band.confirmed ? (
                                  <Badge className="text-xs bg-green-600 text-white">Confirmed</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{band.genre} · {band.email}</p>
                            </div>

                            {!band.confirmed && (
                              <div className="flex items-center gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                                  disabled={isBusy}
                                  onClick={() => handleAccept(gig._id, band.email)}
                                >
                                  {isAccepting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                  {isAccepting ? "..." : "Accept"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50 h-8 px-3"
                                  disabled={isBusy}
                                  onClick={() => handleRemove(gig._id, band.email)}
                                >
                                  {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3 mr-1" />}
                                  {isRemoving ? "..." : "Remove"}
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
