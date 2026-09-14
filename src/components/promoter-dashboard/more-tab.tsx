"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Building2, TrendingUp, Users, DollarSign, Plus, User } from "lucide-react"
import { ProfileManagement } from "@/components/ui/profile-management"
import { authApi } from "@/lib/api"
import { authUtils, dateUtils } from "@/lib/utils"
import { AssignedLocation, gigLocationId, usePromoterGigs } from "./usePromoterGigs"

interface MoreTabProps {
  locations: AssignedLocation[];
}

const DOOR_PERSONS_KEY = "promoter-door-persons"

export function MoreTab({ locations }: MoreTabProps) {
  const currentUser = typeof window !== "undefined" ? authUtils.getCurrentUser() : null
  const firstName = currentUser ? authUtils.getUserFullName().split(" ")[0] : ""
  const lastName = currentUser ? authUtils.getUserFullName().split(" ").slice(1).join(" ") : ""
  const [moreSubcategory, setMoreSubcategory] = useState("analytics")
  const [newDoorPersonName, setNewDoorPersonName] = useState("")
  const [newDoorPersonEmail, setNewDoorPersonEmail] = useState("")
  const [savedDoorPersons, setSavedDoorPersons] = useState<Array<{ id: string; name: string; email: string }>>(() => {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(localStorage.getItem(DOOR_PERSONS_KEY) || "[]")
    } catch {
      return []
    }
  })
  const [profilePhone, setProfilePhone] = useState("")

  const { gigs } = usePromoterGigs(locations)

  useEffect(() => {
    authApi.getProfile().then(res => {
      if (res.success && res.data?.phone) setProfilePhone(res.data.phone)
    }).catch(() => {})
  }, [])

  const gigRevenue = (gig: { ticketsSold?: number; ticketPrice?: number }) =>
    (gig.ticketsSold ?? 0) * (gig.ticketPrice ?? 0)

  const analytics = useMemo(() => {
    const withCapacity = gigs.filter(g => g.ticketCapacity > 0)
    const avgFillRate = withCapacity.length > 0
      ? Math.round(withCapacity.reduce((sum, g) => sum + (g.ticketsSold ?? 0) / g.ticketCapacity, 0) / withCapacity.length * 100)
      : 0
    const totalRevenue = gigs.reduce((sum, g) => sum + gigRevenue(g), 0)
    const totalTicketsSold = gigs.reduce((sum, g) => sum + (g.ticketsSold ?? 0), 0)

    // Tickets sold per genre, as a share of all tickets sold
    const genreTickets = new Map<string, number>()
    for (const g of gigs) {
      if (!g.eventGenre) continue
      genreTickets.set(g.eventGenre, (genreTickets.get(g.eventGenre) ?? 0) + (g.ticketsSold ?? 0))
    }
    const genrePerformance = Array.from(genreTickets.entries())
      .map(([genre, tickets]) => ({
        genre,
        share: totalTicketsSold > 0 ? Math.round(tickets / totalTicketsSold * 100) : 0,
      }))
      .sort((a, b) => b.share - a.share)

    // This month vs last month, bucketed by event date
    const now = new Date()
    const monthOf = (g: { eventDate: string }) => {
      const d = dateUtils.parseEventDate(g.eventDate)
      return d.getFullYear() * 12 + d.getMonth()
    }
    const thisMonth = now.getFullYear() * 12 + now.getMonth()
    const thisMonthGigs = gigs.filter(g => monthOf(g) === thisMonth)
    const lastMonthGigs = gigs.filter(g => monthOf(g) === thisMonth - 1)
    const thisMonthRevenue = thisMonthGigs.reduce((sum, g) => sum + gigRevenue(g), 0)
    const lastMonthRevenue = lastMonthGigs.reduce((sum, g) => sum + gigRevenue(g), 0)

    const ratedGigs = gigs.filter(g => (g.rating ?? 0) > 0)
    const avgRating = ratedGigs.length > 0
      ? (ratedGigs.reduce((sum, g) => sum + g.rating, 0) / ratedGigs.length).toFixed(1)
      : null

    return { avgFillRate, totalRevenue, totalTicketsSold, genrePerformance, thisMonthGigs, lastMonthGigs, thisMonthRevenue, lastMonthRevenue, avgRating }
  }, [gigs])

  const locationPerformance = useMemo(() =>
    locations.map(location => {
      const locationGigs = gigs.filter(g => gigLocationId(g) === location._id)
      const withCapacity = locationGigs.filter(g => g.ticketCapacity > 0)
      return {
        id: location._id,
        name: location.name,
        location: `${location.city}, ${location.state}`,
        eventsCount: locationGigs.length,
        revenue: locationGigs.reduce((sum, g) => sum + gigRevenue(g), 0),
        fillRate: withCapacity.length > 0
          ? Math.round(withCapacity.reduce((sum, g) => sum + (g.ticketsSold ?? 0) / g.ticketCapacity, 0) / withCapacity.length * 100)
          : null,
      }
    }), [locations, gigs])

  const persistDoorPersons = (persons: Array<{ id: string; name: string; email: string }>) => {
    setSavedDoorPersons(persons)
    try {
      localStorage.setItem(DOOR_PERSONS_KEY, JSON.stringify(persons))
    } catch {}
  }

  const addDoorPerson = () => {
    if (newDoorPersonName.trim() && newDoorPersonEmail.trim()) {
      persistDoorPersons([...savedDoorPersons, {
        id: Date.now().toString(),
        name: newDoorPersonName.trim(),
        email: newDoorPersonEmail.trim(),
      }])
      setNewDoorPersonName("")
      setNewDoorPersonEmail("")
    }
  }

  const removeDoorPerson = (id: string) => {
    persistDoorPersons(savedDoorPersons.filter(person => person.id !== id))
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="font-serif font-bold text-xl">More</h2>

      {/* Subcategory Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={moreSubcategory === "analytics" ? "default" : "outline"}
          size="sm"
          onClick={() => setMoreSubcategory("analytics")}
          className={`whitespace-nowrap ${moreSubcategory === "analytics" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <BarChart3 className="w-4 h-4 mr-1" />
          Analytics
        </Button>
        <Button
          variant={moreSubcategory === "settings" ? "default" : "outline"}
          size="sm"
          onClick={() => setMoreSubcategory("settings")}
          className={`whitespace-nowrap ${moreSubcategory === "settings" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <Building2 className="w-4 h-4 mr-1" />
          Settings
        </Button>
        <Button
          variant={moreSubcategory === "profile" ? "default" : "outline"}
          size="sm"
          onClick={() => setMoreSubcategory("profile")}
          className={`whitespace-nowrap ${moreSubcategory === "profile" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <User className="w-4 h-4 mr-1" />
          Profile
        </Button>
      </div>

      {/* Profile Subcategory */}
      {moreSubcategory === "profile" && (
        <ProfileManagement
          userType="promoter"
          initialData={{
            firstName,
            lastName,
            email: currentUser?.email || "",
            phone: profilePhone,
            company: "",
            location: "",
            bio: ""
          }}
          onSave={async (data) => {
            await authApi.updateProfile({
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
            })
          }}
        />
      )}

      {/* Analytics Subcategory */}
      {moreSubcategory === "analytics" && (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg text-foreground">Analytics</h3>

          {/* Overall Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-card border-border text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{analytics.avgFillRate}%</div>
              <div className="text-sm text-muted-foreground">Avg Fill Rate</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                ${analytics.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {analytics.totalTicketsSold.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Tickets Sold</div>
            </Card>
          </div>

          {/* Location Performance Comparison */}
          <Card className="p-4 bg-card border-border">
            <h4 className="font-semibold text-foreground mb-4">Location Performance</h4>
            {locationPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No locations yet — ask a venue to add you as an authorized promoter.
              </p>
            ) : (
              <div className="space-y-4">
                {locationPerformance.map((location) => (
                  <div key={location.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">{location.name}</span>
                        <div className="text-xs text-muted-foreground">{location.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-foreground">{location.eventsCount}</div>
                        <div className="text-muted-foreground">Events</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-400">${location.revenue.toLocaleString()}</div>
                        <div className="text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-foreground">{location.fillRate ?? "—"}{location.fillRate !== null ? "%" : ""}</div>
                        <div className="text-muted-foreground">Fill Rate</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Genre Performance */}
          <Card className="p-4 bg-card border-border">
            <h4 className="font-semibold text-foreground mb-4">Ticket Sales by Genre</h4>
            {analytics.genrePerformance.length === 0 || analytics.totalTicketsSold === 0 ? (
              <p className="text-sm text-muted-foreground">No ticket sales yet.</p>
            ) : (
              <div className="space-y-3">
                {analytics.genrePerformance.map(({ genre, share }) => (
                  <div key={genre} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{genre}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={share} className="w-20 h-2" />
                      <span className="text-sm text-muted-foreground">{share}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Monthly Trends */}
          <Card className="p-4 bg-card border-border">
            <h4 className="font-semibold text-foreground mb-4">This Month</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="text-green-400">
                  ${analytics.thisMonthRevenue.toLocaleString()}
                  {analytics.lastMonthRevenue > 0 && (
                    ` (${analytics.thisMonthRevenue >= analytics.lastMonthRevenue ? "+" : ""}${Math.round((analytics.thisMonthRevenue - analytics.lastMonthRevenue) / analytics.lastMonthRevenue * 100)}% vs last month)`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Events</span>
                <span className="text-blue-400">
                  {analytics.thisMonthGigs.length} this month, {analytics.lastMonthGigs.length} last month
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average rating</span>
                <span className="text-foreground">{analytics.avgRating ? `${analytics.avgRating}/5.0` : "No ratings yet"}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Settings Subcategory */}
      {moreSubcategory === "settings" && (
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4">Manage Door Persons</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-foreground">Door Person Name</Label>
                <Input
                  placeholder="Enter door person name"
                  value={newDoorPersonName}
                  onChange={(e) => setNewDoorPersonName(e.target.value)}
                  className="mt-1 bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-sm text-foreground">Email Address</Label>
                <Input
                  placeholder="Enter email address"
                  type="email"
                  value={newDoorPersonEmail}
                  onChange={(e) => setNewDoorPersonEmail(e.target.value)}
                  className="mt-1 bg-input border-border text-foreground"
                />
              </div>
            </div>
            <Button
              onClick={addDoorPerson}
              disabled={!newDoorPersonName.trim() || !newDoorPersonEmail.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Door Person
            </Button>

            {savedDoorPersons.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Saved Door Persons</Label>
                <div className="space-y-2">
                  {savedDoorPersons.map((doorPerson) => (
                    <div key={doorPerson.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium text-foreground">{doorPerson.name}</div>
                        <div className="text-sm text-muted-foreground">{doorPerson.email}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDoorPerson(doorPerson.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
