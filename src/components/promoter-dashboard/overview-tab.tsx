"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Building2, Calendar, Users, DollarSign, Clock } from "lucide-react"
import { LocationCard } from "./location-card"

interface OverviewTabProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLocation: string;
}

export function OverviewTab({ searchQuery, onSearchChange, selectedLocation }: OverviewTabProps) {
  // Memoize data fetching to prevent unnecessary re-renders
  const myLocations = useMemo(() => [
    { id: "muggys", name: "Muggsy's", location: "St. Augustine, FL", type: "Bar", revenue: "$2,500", capacity: 100, image: "/images/MUGS.jpeg", instagram: "@muggys", eventsCount: 12 },
    { id: "sarbez", name: "Sarbez", location: "St. Augustine, FL", type: "Restaurant", revenue: "$1,800", capacity: 80, image: "/images/SARBEZ.jpg", instagram: "@sarbez", eventsCount: 8 },
    { id: "alfreds", name: "Alfred's", location: "St. Augustine, FL", type: "Venue", revenue: "$3,200", capacity: 150, image: "/images/Alfreds.jpg", instagram: "@alfreds", eventsCount: 15 }
  ], [])
  const allEvents = useMemo(() => [
    {
      id: 1,
      name: "Rock Night",
      date: "2024-12-15",
      location: "Muggsy's",
      status: "confirmed",
      artist: "The Midnight Keys",
      genre: "Rock"
    },
    {
      id: 2,
      name: "Jazz Evening",
      date: "2024-12-20",
      location: "Sarbez",
      status: "pending",
      artist: "Jazz Collective",
      genre: "Jazz"
    }
  ], [])
  const allArtistApplications = useMemo(() => [
    {
      id: 1,
      artist: "The Midnight Keys",
      genre: "Rock",
      rating: 4.8,
      followers: "2.3K",
      bio: "High-energy rock band with a modern twist. Known for electrifying live performances and original compositions.",
      image: "/images/BandFallBack.PNG"
    },
    {
      id: 2,
      artist: "Jazz Collective",
      genre: "Jazz",
      rating: 4.6,
      followers: "1.8K",
      bio: "Smooth jazz ensemble bringing classic standards and contemporary arrangements to intimate venues.",
      image: "/images/BandFallBack.PNG"
    }
  ], [])

  // Filtered data based on search and location selection
  const filteredLocations = useMemo(() => {
    let filtered = myLocations
    
    if (selectedLocation !== "all") {
      filtered = filtered.filter(location => location.id === selectedLocation)
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [myLocations, selectedLocation, searchQuery])

  const filteredUpcomingEvents = useMemo(() => {
    let filtered = allEvents
    
    if (selectedLocation !== "all") {
      // Filter events by location (this would need to be connected to actual location data)
      filtered = filtered.filter(event => event.status !== "completed")
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(event => 
        event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.genre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [allEvents, selectedLocation, searchQuery])

  const filteredArtistApplications = useMemo(() => {
    let filtered = allArtistApplications
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(application => 
        application.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.genre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [allArtistApplications, searchQuery])

  // Memoize total revenue calculation for better performance
  const totalRevenue = useMemo(() => {
    return filteredLocations.reduce((sum, location) => {
      const revenue = location.revenue ? parseFloat(location.revenue.replace(/[$,]/g, '')) : 0
      return sum + revenue
    }, 0)
  }, [filteredLocations])

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
          <div className="text-2xl font-bold text-foreground">{filteredUpcomingEvents.length}</div>
          <div className="text-sm text-muted-foreground">Total Events</div>
        </Card>
        <Card className="p-4 bg-card border-border text-center">
          <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{filteredArtistApplications.length}</div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredLocations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Recent Activity</h3>
        <Card className="p-4 bg-card border-border">
          <div className="space-y-3">
            {selectedLocation === "all" ? (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">2 hours ago</span>
                  <span className="text-foreground">New application from &quot;Rock Solid&quot; for Electric Factory</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">1 day ago</span>
                  <span className="text-foreground">Event &quot;Jazz Night&quot; at The Blue Note went live</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">3 days ago</span>
                  <span className="text-foreground">Revenue milestone reached at The Basement</span>
                </div>
              </>
            ) : (
              <>
                {filteredUpcomingEvents.length > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Recent</span>
                    <span className="text-foreground">
                      {filteredUpcomingEvents.length} event{filteredUpcomingEvents.length !== 1 ? 's' : ''} at {filteredLocations[0]?.name}
                    </span>
                  </div>
                )}
                {filteredArtistApplications.length > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Recent</span>
                    <span className="text-foreground">
                      {filteredArtistApplications.length} application{filteredArtistApplications.length !== 1 ? 's' : ''} received
                    </span>
                  </div>
                )}
                {filteredLocations.length > 0 && (
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="text-foreground">
                      ${filteredLocations[0]?.revenue} generated at {filteredLocations[0]?.name}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
