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
import { Calendar, Plus, Users, TrendingUp, DollarSign, Star, Eye } from "lucide-react"
import Image from "next/image"

export function VenueDashboard() {
  const [activeTab, setActiveTab] = useState("events")
  const [showPostGig, setShowPostGig] = useState(false)

  const myEvents = [
    {
      id: 1,
      artist: "The Midnight Keys",
      date: "Sat, Oct 12",
      time: "8 PM doors",
      genre: "Jazz",
      ticketsSold: 50,
      totalTickets: 75,
      guarantee: 400,
      currentEarnings: 600,
      status: "live",
      applications: 3,
      image: "/images/venu-logo.png",
    },
    {
      id: 2,
      artist: "Electric Pulse",
      date: "Fri, Oct 18",
      time: "9 PM",
      genre: "Electronic",
      ticketsSold: 0,
      totalTickets: 100,
      guarantee: 300,
      currentEarnings: 0,
      status: "posted",
      applications: 7,
      image: "/images/venu-logo.png",
    },
    {
      id: 3,
      artist: "Acoustic Souls",
      date: "Thu, Oct 3",
      time: "7 PM",
      genre: "Folk",
      ticketsSold: 45,
      totalTickets: 60,
      guarantee: 250,
      currentEarnings: 350,
      status: "completed",
      applications: 0,
      image: "/images/venu-logo.png",
    },
  ]

  const artistApplications = [
    {
      id: 1,
      artist: "Luna & The Waves",
      genre: "Indie Rock",
      followers: "2.3K",
      rating: 4.7,
      bio: "Dreamy indie rock with ethereal vocals and atmospheric soundscapes.",
      image: "/images/venu-logo.png",
    },
    {
      id: 2,
      artist: "Jazz Collective",
      genre: "Jazz",
      followers: "1.8K",
      rating: 4.9,
      bio: "Modern jazz ensemble bringing fresh energy to classic standards.",
      image: "/images/venu-logo.png",
    },
  ]

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
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm">+$200 if 50+ tickets</span>
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
                  placeholder="e.g. Must promote on social media, arrive 1 hour early for soundcheck..."
                  className="mt-2 bg-input border-border text-foreground min-h-[100px]"
                />
              </div>
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
          <Button onClick={() => setShowPostGig(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-1" />
            Post Gig
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-card border-b border-border rounded-none h-12">
          <TabsTrigger
            value="events"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            My Events
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

        {/* My Events Tab */}
        <TabsContent value="events" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">My Events</h2>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-1" />
              Calendar
            </Button>
          </div>

          <div className="space-y-4">
            {myEvents.map((event) => {
              const progress = (event.ticketsSold / event.totalTickets) * 100

              return (
                <Card key={event.id} className="p-4 bg-card border-border">
                  <div className="flex gap-4">
                    <Image
                      src={event.image || "/images/venu-logo.png"}
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
                            <Calendar className="w-4 h-4" />
                            {event.date} - {event.time}
                          </div>
                        </div>
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
                        {event.status === "posted" && (
                          <span className="text-sm text-accent">{event.applications} applications</span>
                        )}
                        {event.status === "live" && (
                          <span className="text-sm text-green-400">${event.currentEarnings} revenue</span>
                        )}
                        {event.status === "completed" && (
                          <span className="text-sm text-green-400">${event.currentEarnings} total</span>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Artist Applications Tab */}
        <TabsContent value="applications" className="p-4 space-y-4">
          <h2 className="font-serif font-bold text-xl">Artist Applications</h2>

          <div className="space-y-4">
            {artistApplications.map((artist) => (
              <Card key={artist.id} className="p-4 bg-card border-border">
                <div className="flex gap-4">
                  <Image
                    src={artist.image || "/images/venu-logo.png"}
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
                        <Users className="w-4 h-4" />
                        {artist.followers}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>

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
        <TabsContent value="analytics" className="p-4 space-y-4">
          <h2 className="font-serif font-bold text-xl">Venue Analytics</h2>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-card border-border text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">87%</div>
              <div className="text-sm text-muted-foreground">Avg Fill Rate</div>
            </Card>

            <Card className="p-4 bg-card border-border text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">$2.4K</div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            </Card>
          </div>

          <Card className="p-4 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Popular Genres</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Jazz</span>
                <div className="flex items-center gap-2">
                  <Progress value={85} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rock</span>
                <div className="flex items-center gap-2">
                  <Progress value={65} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Electronic</span>
                <div className="flex items-center gap-2">
                  <Progress value={45} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Recent Performance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last 30 days</span>
                <span className="text-green-400">+12% ticket sales</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Artist satisfaction</span>
                <span className="text-foreground">4.8/5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Repeat bookings</span>
                <span className="text-foreground">23%</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
