"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Building2, Calendar, Users, DollarSign, Loader2 } from "lucide-react"
import { LocationCard } from "./location-card"
import { gigApi, GigProfile } from "@/lib/api"
import { authUtils, dateUtils } from "@/lib/utils"

interface AssignedLocation {
  _id: string;
  name: string;
  city: string;
  state: string;
  capacity: number;
}

interface OverviewTabProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLocation: string;
  locations: AssignedLocation[];
}

function gigLocationId(gig: GigProfile): string | undefined {
  const loc = gig.selectedLocation as unknown
  if (!loc) return undefined
  if (typeof loc === "string") return loc
  return (loc as { _id?: string })._id
}

export function OverviewTab({ searchQuery, onSearchChange, selectedLocation, locations }: OverviewTabProps) {
  const [gigs, setGigs] = useState<GigProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const currentUserId = authUtils.getCurrentUser()?.id

  useEffect(() => {
    let cancelled = false

    async function loadGigs() {
      setIsLoading(true)
      try {
        const requests: Promise<{ success: boolean; data?: GigProfile[] }>[] = locations.map(loc =>
          gigApi.getGigsByLocation(loc._id, 1, 100)
        )
        if (currentUserId) {
          requests.push(gigApi.getGigsByCreator(currentUserId, 1, 100))
        }
        const results = await Promise.all(requests)
        if (cancelled) return

        const byId = new Map<string, GigProfile>()
        for (const res of results) {
          if (res.success && res.data) {
            for (const gig of res.data) {
              byId.set(gig._id, gig)
            }
          }
        }
        setGigs(Array.from(byId.values()))
      } catch {
        if (!cancelled) setGigs([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadGigs()
    return () => { cancelled = true }
  }, [locations, currentUserId])

  // Filtered data based on search and location selection
  const filteredLocations = useMemo(() => {
    let filtered = locations

    if (selectedLocation !== "all") {
      filtered = filtered.filter(location => location._id === selectedLocation)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(q) ||
        `${location.city}, ${location.state}`.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [locations, selectedLocation, searchQuery])

  const filteredGigs = useMemo(() => {
    let filtered = gigs

    if (selectedLocation !== "all") {
      filtered = filtered.filter(gig => gigLocationId(gig) === selectedLocation)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(gig =>
        gig.eventName?.toLowerCase().includes(q) ||
        gig.eventGenre?.toLowerCase().includes(q) ||
        gig.bands?.some(band => band.name?.toLowerCase().includes(q))
      )
    }

    return filtered
  }, [gigs, selectedLocation, searchQuery])

  // Pending artist applications = unconfirmed bands on the promoter's gigs
  const pendingApplications = useMemo(() =>
    filteredGigs.flatMap(gig =>
      (gig.bands ?? [])
        .filter(band => band.confirmed === false)
        .map(band => ({ band, gig }))
    ), [filteredGigs])

  const totalRevenue = useMemo(() =>
    filteredGigs.reduce((sum, gig) => sum + (gig.ticketsSold ?? 0) * (gig.ticketPrice ?? 0), 0),
    [filteredGigs])

  // Per-location events count and revenue, computed from real gigs
  const locationCards = useMemo(() =>
    filteredLocations.map(location => {
      const locationGigs = gigs.filter(gig => gigLocationId(gig) === location._id)
      return {
        id: location._id,
        name: location.name,
        location: `${location.city}, ${location.state}`,
        capacity: location.capacity,
        eventsCount: locationGigs.length,
        revenue: locationGigs.reduce((sum, gig) => sum + (gig.ticketsSold ?? 0) * (gig.ticketPrice ?? 0), 0),
      }
    }), [filteredLocations, gigs])

  const upcomingGigs = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return filteredGigs
      .filter(gig => dateUtils.parseEventDate(gig.eventDate) >= today && gig.status !== "completed")
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
  }, [filteredGigs])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Dashboard Overview</h2>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events, artists, locations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64 bg-background"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border text-center">
          <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{filteredLocations.length}</div>
          <div className="text-sm text-muted-foreground">Active Locations</div>
        </Card>
        <Card className="p-4 bg-card border-border text-center">
          <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{filteredGigs.length}</div>
          <div className="text-sm text-muted-foreground">Total Events</div>
        </Card>
        <Card className="p-4 bg-card border-border text-center">
          <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{pendingApplications.length}</div>
          <div className="text-sm text-muted-foreground">Applications</div>
        </Card>
        <Card className="p-4 bg-card border-border text-center">
          <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Revenue</div>
        </Card>
      </div>

      {/* Locations Overview */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">My Locations</h3>
        {locationCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locationCards.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
        ) : (
          <Card className="p-6 bg-card border-border text-center">
            <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-foreground font-medium">No locations yet</p>
            <p className="text-sm text-muted-foreground">
              Ask a venue to add you as an authorized promoter and their location will show up here.
            </p>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Recent Activity</h3>
        <Card className="p-4 bg-card border-border">
          {pendingApplications.length === 0 && upcomingGigs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">No recent activity yet</p>
          ) : (
            <div className="space-y-3">
              {pendingApplications.slice(0, 3).map(({ band, gig }) => (
                <div key={`${gig._id}-${band.email}`} className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Pending</span>
                  <span className="text-foreground">
                    &quot;{band.name}&quot; applied to {gig.eventName}
                  </span>
                </div>
              ))}
              {upcomingGigs.slice(0, 3).map((gig) => (
                <div key={gig._id} className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{dateUtils.formatEventDate(gig.eventDate, { weekday: "short", month: "short", day: "numeric" })}</span>
                  <span className="text-foreground">
                    {gig.eventName}
                    {typeof gig.selectedLocation === "object" && gig.selectedLocation?.name
                      ? ` at ${gig.selectedLocation.name}`
                      : ""}
                    {" — "}{gig.ticketsSold ?? 0} tickets sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
