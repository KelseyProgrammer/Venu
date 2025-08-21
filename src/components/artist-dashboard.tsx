"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, MapPin, Calendar, Star, TrendingUp, Share2 } from "lucide-react"
import Image from "next/image"
import { GigDetails } from "./gig-details"

export function ArtistDashboard() {
  const [activeTab, setActiveTab] = useState("discover")
  const [selectedGig, setSelectedGig] = useState<string | null>(null)

  const mockGigs = [
    {
      id: 1,
      venue: "Muggsy's Bar",
      location: "213 W King St, St. Augustine, FL 32084",
      date: "Sat, Oct 12",
      time: "8 PM doors",
      genre: "Rock",
      guarantee: 200,
      tier1: { amount: 200, threshold: 30, color: "bg-yellow-500" },
      tier2: { amount: 400, threshold: 50, color: "bg-green-500" },
      tier3: { amount: 600, threshold: 100, color: "bg-blue-500" },
      ticketsSold: 37,
      totalTickets: 50,
      rating: 4.8,
      requirements: ["PA system", "Backline provided"],
      image: "/images/MUGS.jpeg",
    },
    {
      id: 2,
      venue: "Sarbez",
      location: "115 Anastasia Blvd, St. Augustine, FL 32080",
      date: "Wed, Oct 16",
      time: "9 PM",
      genre: "Rock",
      guarantee: 150,
      tier1: { amount: 150, threshold: 25, color: "bg-yellow-500" },
      tier2: { amount: 300, threshold: 40, color: "bg-green-500" },
      tier3: { amount: 500, threshold: 75, color: "bg-blue-500" },
      ticketsSold: 12,
      totalTickets: 75,
      rating: 4.5,
      requirements: ["Sound system", "Early-bird pricing"],
      image: "/images/SARBEZ.jpg",
    },
    {
      id: 3,
      venue: "The Jazz Cellar",
      location: "East Side",
      date: "Fri, Oct 18",
      time: "7 PM",
      genre: "Jazz",
      guarantee: 300,
      tier1: { amount: 300, threshold: 40, color: "bg-yellow-500" },
      tier2: { amount: 500, threshold: 60, color: "bg-green-500" },
      tier3: { amount: 800, threshold: 100, color: "bg-blue-500" },
      ticketsSold: 0,
      totalTickets: 100,
      rating: 4.9,
      requirements: ["Acoustic preferred", "PA system"],
      image: "/images/venu-logo.png",
    },
  ]

  const myBookings = [
    {
      id: 1,
      venue: "Muggsy's Bar",
      date: "Sat, Oct 12",
      time: "8 PM doors",
      status: "confirmed",
      ticketsSold: 50,
      totalTickets: 75,
      earnings: 400,
      image: "/images/MUGS.jpeg",
    },
    {
      id: 2,
      venue: "Sarbez",
      date: "Thu, Oct 3",
      time: "7 PM",
      status: "completed",
      ticketsSold: 45,
      totalTickets: 60,
      earnings: 350,
      image: "/images/SARBEZ.jpg",
    },
  ]

  const calculateProgress = (sold: number, total: number) => (sold / total) * 100

  const getCurrentTier = (gig: (typeof mockGigs)[0]) => {
    if (gig.ticketsSold >= gig.tier3.threshold) return { ...gig.tier3, name: "Tier 3" }
    if (gig.ticketsSold >= gig.tier2.threshold) return { ...gig.tier2, name: "Tier 2" }
    if (gig.ticketsSold >= gig.tier1.threshold) return { ...gig.tier1, name: "Tier 1" }
    return { amount: gig.guarantee, threshold: 0, color: "bg-gray-500", name: "Guarantee" }
  }

  if (selectedGig) {
    return <GigDetails gigId={selectedGig} onBack={() => setSelectedGig(null)} />
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
            <Button variant="ghost" size="sm">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-card border-b border-border rounded-none h-12">
          <TabsTrigger
            value="discover"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Discover
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Bookings
          </TabsTrigger>
          <TabsTrigger
            value="earnings"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Earnings
          </TabsTrigger>
          <TabsTrigger
            value="tools"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Tools
          </TabsTrigger>
        </TabsList>

        {/* Discover Gigs Tab */}
        <TabsContent value="discover" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">Trending venues near you</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>

          <div className="space-y-4">
            {mockGigs.map((gig) => {
              const currentTier = getCurrentTier(gig)
              const progress = calculateProgress(gig.ticketsSold, gig.totalTickets)

              return (
                <Card key={gig.id} className="p-4 bg-card border-border">
                  <div className="flex gap-4">
                    <div className="relative">
                      <Image
                        src={gig.image || "/images/venu-logo.png"}
                        alt={gig.venue}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover w-20 h-20"
                      />
                      <div className="absolute -top-1 -right-1">
                        <Badge variant="secondary" className="text-xs bg-accent text-accent-foreground">
                          {gig.genre}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{gig.venue}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {gig.date} - {gig.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {gig.rating}
                          </span>
                        </div>
                      </div>

                      {/* Payout Tiers */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">${gig.guarantee} (guaranteed)</span>
                          <span className="text-foreground font-medium">Current: ${currentTier.amount}</span>
                        </div>

                        <div className="space-y-1">
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {gig.ticketsSold}/{gig.totalTickets} tickets sold
                            </span>
                            <span>Next tier at {gig.tier2.threshold} tickets</span>
                          </div>
                        </div>

                        {/* Tier indicators */}
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <span>+$200 if 30+ tickets</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>+$200 if 50+ tickets</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>+$200 if 100+ tickets</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-transparent"
                          onClick={() => setSelectedGig(gig.id.toString())}
                        >
                          See Checklist
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => setSelectedGig(gig.id.toString())}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* My Bookings Tab */}
        <TabsContent value="bookings" className="p-4 space-y-4">
          <h2 className="font-serif font-bold text-xl">My Bookings</h2>

          <div className="space-y-4">
            {myBookings.map((booking) => (
              <Card key={booking.id} className="p-4 bg-card border-border">
                <div className="flex gap-4">
                  <Image
                    src={booking.image || "/images/venu-logo.png"}
                    alt={booking.venue}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover w-20 h-20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{booking.venue}</h3>
                      <Badge
                        variant={booking.status === "confirmed" ? "default" : "secondary"}
                        className={booking.status === "confirmed" ? "bg-green-600" : ""}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {booking.date} - {booking.time}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {booking.ticketsSold}/{booking.totalTickets} tickets
                      </span>
                      <span className="font-semibold text-green-400">${booking.earnings}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="p-4 space-y-4">
          <h2 className="font-serif font-bold text-xl">Earnings Tracker</h2>

          <Card className="p-6 bg-card border-border">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-full border-8 border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">$620</div>
                    <div className="text-sm text-muted-foreground">of $300 goal</div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full border-8 border-primary border-r-transparent border-b-transparent transform rotate-45" />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Upcoming payouts</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Oct 12</span>
                    <span className="text-green-400">$400 pending</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Oct 5</span>
                    <span className="text-green-400">$200 paid</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Promotion Tools Tab */}
        <TabsContent value="tools" className="p-4 space-y-4">
          <h2 className="font-serif font-bold text-xl">Promotion Tools</h2>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-card border-border text-center">
              <Share2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-foreground mb-1">Share Gig</h3>
              <p className="text-xs text-muted-foreground">Auto-generated posts</p>
            </Card>

            <Card className="p-4 bg-card border-border text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-medium text-foreground mb-1">Analytics</h3>
              <p className="text-xs text-muted-foreground">Track engagement</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
