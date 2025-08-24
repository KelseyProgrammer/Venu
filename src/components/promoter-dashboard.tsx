"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Users, TrendingUp, DollarSign, Star, Eye, Building2, Filter, Search, BarChart3, Clock, MapPin } from "lucide-react"
import Image from "next/image"

export function PromoterDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedVenue, setSelectedVenue] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showPostGig, setShowPostGig] = useState(false)
  const [selectedDoorPerson, setSelectedDoorPerson] = useState("")
  const [doorPersonEmail, setDoorPersonEmail] = useState("")
  const [requirements, setRequirements] = useState<Array<{ id: string; text: string; checked: boolean }>>([])
  const [requirementsInput, setRequirementsInput] = useState("")

  // Mock data for venues the promoter works with
  const myVenues = [
    {
      id: "venue1",
      name: "The Blue Note",
      location: "New York, NY",
      type: "Jazz Club",
      eventsCount: 12,
      revenue: "$8.2K",
      image: "/images/venu-logo.png",
    },
    {
      id: "venue2",
      name: "Electric Factory",
      location: "Philadelphia, PA",
      type: "Concert Hall",
      eventsCount: 8,
      revenue: "$15.7K",
      image: "/images/venu-logo.png",
    },
    {
      id: "venue3",
      name: "The Basement",
      location: "Nashville, TN",
      type: "Live Music Bar",
      eventsCount: 15,
      revenue: "$6.8K",
      image: "/images/venu-logo.png",
    },
  ]

  // Mock data for upcoming events across all venues
  const upcomingEvents = [
    {
      id: 1,
      artist: "The Midnight Keys",
      venue: "The Blue Note",
      date: "Sat, Oct 12",
      time: "8 PM doors",
      genre: "Jazz",
      ticketsSold: 50,
      totalTickets: 75,
      status: "live",
      revenue: "$600",
      image: "/images/venu-logo.png",
    },
    {
      id: 2,
      artist: "Electric Pulse",
      venue: "Electric Factory",
      date: "Fri, Oct 18",
      time: "9 PM",
      genre: "Electronic",
      ticketsSold: 0,
      totalTickets: 100,
      status: "posted",
      revenue: "$0",
      image: "/images/venu-logo.png",
    },
    {
      id: 3,
      artist: "Acoustic Souls",
      venue: "The Basement",
      date: "Thu, Oct 3",
      time: "7 PM",
      genre: "Folk",
      ticketsSold: 45,
      totalTickets: 60,
      status: "completed",
      revenue: "$350",
      image: "/images/venu-logo.png",
    },
    {
      id: 4,
      artist: "Luna & The Waves",
      venue: "The Blue Note",
      date: "Sun, Oct 20",
      time: "7:30 PM",
      genre: "Indie Rock",
      ticketsSold: 12,
      totalTickets: 80,
      status: "posted",
      revenue: "$120",
      image: "/images/venu-logo.png",
    },
  ]

  // Mock data for artist applications across all venues
  const artistApplications = [
    {
      id: 1,
      artist: "Luna & The Waves",
      venue: "The Blue Note",
      genre: "Indie Rock",
      followers: "2.3K",
      rating: 4.7,
      bio: "Dreamy indie rock with ethereal vocals and atmospheric soundscapes.",
      appliedFor: "Jazz Night - Oct 25",
      status: "pending",
      image: "/images/venu-logo.png",
    },
    {
      id: 2,
      artist: "Jazz Collective",
      venue: "The Blue Note",
      genre: "Jazz",
      followers: "1.8K",
      rating: 4.9,
      bio: "Modern jazz ensemble bringing fresh energy to classic standards.",
      appliedFor: "Jazz Night - Oct 25",
      status: "approved",
      image: "/images/venu-logo.png",
    },
    {
      id: 3,
      artist: "Rock Solid",
      venue: "Electric Factory",
      genre: "Rock",
      followers: "5.1K",
      rating: 4.6,
      bio: "High-energy rock band with powerful vocals and driving rhythms.",
      appliedFor: "Rock Show - Nov 2",
      status: "pending",
      image: "/images/venu-logo.png",
    },
  ]

  // Filter events based on selected venue and search query
  const filteredEvents = upcomingEvents.filter(event => {
    const venueMatch = selectedVenue === "all" || event.venue === myVenues.find(v => v.id === selectedVenue)?.name
    const searchMatch = event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       event.genre.toLowerCase().includes(searchQuery.toLowerCase())
    return venueMatch && searchMatch
  })

  // Filter applications based on selected venue and search query
  const filteredApplications = artistApplications.filter(app => {
    const venueMatch = selectedVenue === "all" || app.venue === myVenues.find(v => v.id === selectedVenue)?.name
    const searchMatch = app.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       app.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       app.genre.toLowerCase().includes(searchQuery.toLowerCase())
    return venueMatch && searchMatch
  })

  const handleRequirementsKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const text = requirementsInput.trim()
      if (text) {
        const newRequirement = {
          id: Date.now().toString(),
          text: text,
          checked: false
        }
        setRequirements([...requirements, newRequirement])
        setRequirementsInput("")
      }
    }
  }

  const toggleRequirement = (id: string) => {
    setRequirements(requirements.map(req => 
      req.id === id ? { ...req, checked: !req.checked } : req
    ))
  }

  const removeRequirement = (id: string) => {
    setRequirements(requirements.filter(req => req.id !== id))
  }

  if (showPostGig) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" onClick={() => setShowPostGig(false)}>
              Cancel
            </Button>
            <h1 className="font-serif font-bold text-lg">Post a Gig</h1>
            <Button className="bg-primary hover:bg-primary/90">Publish</Button>
          </div>
        </div>

        <div className="p-4 space-y-6 max-w-sm mx-auto">
          <Card className="p-6 bg-card border-border">
            <div className="space-y-4">
              <div>
                <Label htmlFor="event-name" className="text-foreground">
                  Event Name
                </Label>
                <Input
                  id="event-name"
                  placeholder="e.g. Jazz Night at The Blue Note"
                  className="mt-2 bg-input border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="venue" className="text-foreground">
                  Venue
                </Label>
                <Select>
                  <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {myVenues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-foreground">
                    Date
                  </Label>
                  <Input id="date" type="date" className="mt-2 bg-input border-border text-foreground" />
                </div>
                <div>
                  <Label htmlFor="time" className="text-foreground">
                    Time
                  </Label>
                  <Input id="time" type="time" className="mt-2 bg-input border-border text-foreground" />
                </div>
              </div>

              <div>
                <Label htmlFor="genre" className="text-foreground">
                  Preferred Genre
                </Label>
                <Select>
                  <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="folk">Folk</SelectItem>
                    <SelectItem value="blues">Blues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="door-person" className="text-foreground">
                  Door Person
                </Label>
                <Select value={selectedDoorPerson} onValueChange={setSelectedDoorPerson}>
                  <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select door person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">SELF</SelectItem>
                    <SelectItem value="add-by-email">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add by email
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {selectedDoorPerson === "add-by-email" && (
                  <div className="mt-3">
                    <Label htmlFor="door-person-email" className="text-sm text-muted-foreground">
                      Door Person Email
                    </Label>
                    <Input
                      id="door-person-email"
                      type="email"
                      placeholder="Enter door person's email address"
                      value={doorPersonEmail}
                      onChange={(e) => setDoorPersonEmail(e.target.value)}
                      className="mt-2 bg-input border-border text-foreground"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="capacity" className="text-foreground">
                  Ticket Capacity
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g. 100"
                  className="mt-2 bg-input border-border text-foreground"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Payout Structure</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="guarantee" className="text-foreground">
                  Guaranteed Minimum
                </Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="guarantee"
                    type="number"
                    placeholder="200"
                    className="pl-10 bg-input border-border text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Bonus Tiers</Label>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="text-sm">+$200 if 30+ tickets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm">+$200 if 50+ tickets</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm">+$200 if 100+ tickets</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Requirements</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="requirements" className="text-foreground">
                  Artist Requirements
                </Label>
                <Textarea
                  id="requirements"
                  placeholder="Type a requirement and press Enter to add it to the list..."
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                  onKeyDown={handleRequirementsKeyDown}
                  className="mt-2 bg-input border-border text-foreground min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Press Enter to add each requirement as a separate item
                </p>
              </div>
              
              {requirements.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">Requirements List:</Label>
                  {requirements.map((requirement) => (
                    <div key={requirement.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <input
                        type="checkbox"
                        checked={requirement.checked}
                        onChange={() => toggleRequirement(requirement.id)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <span className={`flex-1 text-sm ${requirement.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {requirement.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(requirement.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image src="/images/venu-logo.png" alt="Venu" width={32} height={32} className="rounded-lg w-8 h-8" />
            <span className="font-serif font-bold text-xl">venu</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Promoter Dashboard
            </Badge>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Venue
            </Button>
            <Button onClick={() => setShowPostGig(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1" />
              Post Gig
            </Button>
          </div>
        </div>
      </div>

      {/* Venue Selector */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium text-muted-foreground">Working with:</Label>
          <Select value={selectedVenue} onValueChange={setSelectedVenue}>
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Select venue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Venues</SelectItem>
              {myVenues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-card border-b border-border rounded-none h-12">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Events
          </TabsTrigger>
          <TabsTrigger
            value="applications"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Applications
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">Dashboard Overview</h2>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events, artists, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-background"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-card border-border text-center">
              <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{myVenues.length}</div>
              <div className="text-sm text-muted-foreground">Active Venues</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{upcomingEvents.length}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{artistApplications.length}</div>
              <div className="text-sm text-muted-foreground">Applications</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">$30.7K</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </Card>
          </div>

          {/* Venues Overview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">My Venues</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myVenues.map((venue) => (
                <Card key={venue.id} className="p-4 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={venue.image}
                      alt={venue.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover w-12 h-12"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{venue.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {venue.location}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">{venue.type}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Events:</span>
                      <span className="text-foreground font-medium">{venue.eventsCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="text-green-400 font-medium">{venue.revenue}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Recent Activity</h3>
            <Card className="p-4 bg-card border-border">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">2 hours ago</span>
                  <span className="text-foreground">New application from "Rock Solid" for Electric Factory</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">1 day ago</span>
                  <span className="text-foreground">Event "Jazz Night" at The Blue Note went live</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">3 days ago</span>
                  <span className="text-foreground">Revenue milestone reached at The Basement</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">All Events</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select>
                <SelectTrigger className="w-32 bg-background">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const progress = (event.ticketsSold / event.totalTickets) * 100

              return (
                <Card key={event.id} className="p-4 bg-card border-border">
                  <div className="flex gap-4">
                    <Image
                      src={event.image}
                      alt={event.artist}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover w-20 h-20"
                    />

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{event.artist}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            {event.venue}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {event.date} - {event.time}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              event.status === "live" ? "default" : event.status === "completed" ? "secondary" : "outline"
                            }
                            className={
                              event.status === "live" ? "bg-green-600" : event.status === "posted" ? "bg-primary" : ""
                            }
                          >
                            {event.status}
                          </Badge>
                          <div className="text-sm text-green-400 font-medium mt-1">
                            {event.revenue}
                          </div>
                        </div>
                      </div>

                      {/* Ticket Sales Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ticket Sales</span>
                          <span className="text-foreground font-medium">
                            {event.ticketsSold}/{event.totalTickets}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {event.genre}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">Artist Applications</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select>
                <SelectTrigger className="w-32 bg-background">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredApplications.map((artist) => (
              <Card key={artist.id} className="p-4 bg-card border-border">
                <div className="flex gap-4">
                  <Image
                    src={artist.image}
                    alt={artist.artist}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover w-15 h-15"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{artist.artist}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-foreground">{artist.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {artist.genre}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {artist.venue}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {artist.followers}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>
                    
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Applied for:</span> {artist.appliedFor}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Decline
                      </Button>
                      <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="p-4 space-y-6">
          <h2 className="font-serif font-bold text-xl">Cross-Venue Analytics</h2>

          {/* Overall Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-card border-border text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">92%</div>
              <div className="text-sm text-muted-foreground">Avg Fill Rate</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">$30.7K</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">1,247</div>
              <div className="text-sm text-muted-foreground">Total Tickets Sold</div>
            </Card>
          </div>

          {/* Venue Performance Comparison */}
          <Card className="p-4 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Venue Performance</h3>
            <div className="space-y-4">
              {myVenues.map((venue) => (
                <div key={venue.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={venue.image}
                      alt={venue.name}
                      width={32}
                      height={32}
                      className="rounded-lg object-cover w-8 h-8"
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground">{venue.name}</span>
                      <div className="text-xs text-muted-foreground">{venue.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-foreground">{venue.eventsCount}</div>
                      <div className="text-muted-foreground">Events</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-400">{venue.revenue}</div>
                      <div className="text-muted-foreground">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">85%</div>
                      <div className="text-muted-foreground">Fill Rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Genre Performance */}
          <Card className="p-4 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Genre Performance Across Venues</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Jazz</span>
                <div className="flex items-center gap-2">
                  <Progress value={88} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">88%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rock</span>
                <div className="flex items-center gap-2">
                  <Progress value={72} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">72%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Electronic</span>
                <div className="flex items-center gap-2">
                  <Progress value={65} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Folk</span>
                <div className="flex items-center gap-2">
                  <Progress value={78} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">78%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Monthly Trends */}
          <Card className="p-4 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Monthly Trends</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue growth</span>
                <span className="text-green-400">+18% vs last month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event count</span>
                <span className="text-blue-400">+5 new events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Artist applications</span>
                <span className="text-yellow-400">+23% increase</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average rating</span>
                <span className="text-foreground">4.7/5.0</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 