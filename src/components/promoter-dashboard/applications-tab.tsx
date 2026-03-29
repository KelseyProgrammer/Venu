"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Building2, Wifi, WifiOff, Calendar, Users } from "lucide-react"
import { usePromoterRealTime } from "@/hooks/usePromoterRealTime"
import { gigApi, GigProfile } from "@/lib/api"

interface ApplicationsTabProps {
  promoterId: string;
}

export function ApplicationsTab({ promoterId }: ApplicationsTabProps) {
  const [gigs, setGigs] = useState<GigProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")

  const { gigUpdates, isConnected, error } = usePromoterRealTime({
    promoterId,
    selectedLocation: "all"
  })

  useEffect(() => {
    if (!promoterId) return
    setLoading(true)
    gigApi.getGigsByCreator(promoterId).then(res => {
      if (res.success && res.data) setGigs(res.data)
    }).finally(() => setLoading(false))
  }, [promoterId])

  // Re-fetch when real-time gig updates arrive
  useEffect(() => {
    if (gigUpdates.length === 0 || !promoterId) return
    gigApi.getGigsByCreator(promoterId).then(res => {
      if (res.success && res.data) setGigs(res.data)
    })
  }, [gigUpdates, promoterId])

  const filteredGigs = statusFilter === "all"
    ? gigs
    : gigs.filter(g => g.status === statusFilter)

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-700 border-gray-200" },
      "pending-confirmation": { label: "Pending", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      posted: { label: "Posted", className: "bg-blue-100 text-blue-700 border-blue-200" },
      live: { label: "Live", className: "bg-green-100 text-green-700 border-green-200" },
      completed: { label: "Completed", className: "bg-purple-100 text-purple-700 border-purple-200" },
    }
    const s = map[status] ?? { label: status, className: "" }
    return <Badge variant="outline" className={`text-xs ${s.className}`}>{s.label}</Badge>
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">My Gigs</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Gigs</SelectItem>
              <SelectItem value="pending-confirmation">Pending</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Real-time Updates */}
      {gigUpdates.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Recent Updates</h3>
          </div>
          <div className="space-y-2">
            {gigUpdates.slice(0, 3).map((update, index) => (
              <div key={index} className="text-sm text-blue-700">
                <span className="font-medium">{update.updatedBy?.email || "Unknown"}</span>
                {" "}updated{" "}
                <span className="font-medium">
                  {String((update.gigData as Record<string, unknown>)?.eventName || "a gig")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading gigs…</div>
      ) : filteredGigs.length === 0 ? (
        <Card className="p-8 text-center bg-card border-border">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No gigs found</h3>
          <p className="text-sm text-muted-foreground">
            {statusFilter === "all" ? "Post a gig to get started." : `No gigs with status "${statusFilter}".`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGigs.map((gig) => {
            const confirmedBands = gig.bands?.filter(b => b.confirmed).length ?? 0
            const totalBands = gig.bands?.length ?? 0
            const location = typeof gig.selectedLocation === "object" && gig.selectedLocation !== null
              ? (gig.selectedLocation as { name?: string }).name
              : undefined

            return (
              <Card key={gig._id} className="p-4 bg-card border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{gig.eventName}</h3>
                      {statusBadge(gig.status)}
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
                      <Badge variant="outline" className="text-xs">{gig.eventGenre}</Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    View
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
