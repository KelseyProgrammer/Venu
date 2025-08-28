"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, MapPin, Calendar, Star, TrendingUp, Share2, BarChart3, FileText, MessageCircle, MoreHorizontal } from "lucide-react"
import Image from "next/image"
import { GigDetails } from "./gig-details"
import { getLocationDisplayName, getLocationImage } from "@/lib/location-data"
import { calculateEventBonusTiers, BonusTier } from "@/lib/bonus-tiers"

export function ArtistDashboard() {
  const [activeTab, setActiveTab] = useState("discover")
  const [selectedGig, setSelectedGig] = useState<string | null>(null)
  
  // Earnings data
  const totalEarnings = 620
  const goalAmount = 300
  const progressPercentage = (totalEarnings / goalAmount) * 100

  const mockGigs = useMemo(() => [
    {
      id: 1,
      location: "muggys", // Use standardized location key
      address: "213 W King St, St. Augustine, FL 32084",
      date: "Sat, Oct 12",
      time: "8 PM doors",
      genre: "Rock",
      guarantee: 200,
      ticketPrice: 25, // Price per ticket
      tier1: { amount: 200, threshold: 30, color: "bg-yellow-500" },
      tier2: { amount: 400, threshold: 50, color: "bg-green-500" },
      tier3: { amount: 600, threshold: 100, color: "bg-blue-500" },
      ticketsSold: 37,
      totalTickets: 50,
      rating: 4.8,
      requirements: ["PA system", "Backline provided"],
      image: "/images/MUGS.jpeg",
      bands: [
        { id: "1", name: "The Midnight Keys", genre: "Rock", setTime: "9 PM", percentage: 60, email: "keys@example.com", guarantee: 200 },
        { id: "2", name: "Opening Act", genre: "Rock", setTime: "8 PM", percentage: 40, email: "opening@example.com", guarantee: 0 }
      ]
    },
    {
      id: 2,
      location: "sarbez", // Use standardized location key
      address: "115 Anastasia Blvd, St. Augustine, FL 32080",
      date: "Wed, Oct 16",
      time: "9 PM",
      genre: "Rock",
      guarantee: 150,
      ticketPrice: 20, // Price per ticket
      tier1: { amount: 150, threshold: 25, color: "bg-yellow-500" },
      tier2: { amount: 300, threshold: 40, color: "bg-green-500" },
      tier3: { amount: 500, threshold: 75, color: "bg-blue-500" },
      ticketsSold: 12,
      totalTickets: 75,
      rating: 4.5,
      requirements: ["Sound system", "Early-bird pricing"],
      image: "/images/SARBEZ.jpg",
      bands: [
        { id: "3", name: "Rock Band", genre: "Rock", setTime: "9 PM", percentage: 70, email: "rock@example.com", guarantee: 150 },
        { id: "4", name: "Support Act", genre: "Rock", setTime: "8 PM", percentage: 30, email: "support@example.com", guarantee: 0 }
      ]
    },
    {
      id: 3,
      location: "alfreds", // Use standardized location key
      address: "222 West King Street, St. Augustine, FL 32084",
      date: "Fri, Oct 18",
      time: "7 PM",
      genre: "Jazz",
      guarantee: 300,
      ticketPrice: 30, // Price per ticket
      tier1: { amount: 300, threshold: 40, color: "bg-yellow-500" },
      tier2: { amount: 500, threshold: 60, color: "bg-green-500" },
      tier3: { amount: 800, threshold: 100, color: "bg-blue-500" },
      ticketsSold: 0,
      totalTickets: 100,
      rating: 4.9,
      requirements: ["Acoustic preferred", "PA system"],
      image: "/images/Alfreds.jpg",
      bands: [
        { id: "5", name: "Jazz Ensemble", genre: "Jazz", setTime: "8 PM", percentage: 100, email: "jazz@example.com", guarantee: 300 }
      ]
    },
  ], [])

  const myBookings = useMemo(() => [
    {
      id: 1,
      location: "muggys", // Use standardized location key
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
      location: "sarbez", // Use standardized location key
      date: "Thu, Oct 3",
      time: "7 PM",
      status: "completed",
      ticketsSold: 45,
      totalTickets: 60,
      earnings: 350,
      image: "/images/SARBEZ.jpg",
    },
  ], [])

  const calculateProgress = useCallback((sold: number, total: number) => (sold / total) * 100, [])

  // Calculate dynamic bonus tiers for each gig
  const getGigBonusTiers = useCallback((gig: (typeof mockGigs)[0]) => {
    if (!gig.bands || gig.bands.length === 0) {
      return []
    }
    
    return calculateEventBonusTiers(
      gig.bands,
      gig.ticketPrice,
      gig.totalTickets,
      gig.ticketsSold
    )
  }, [])

  // Memoize bonus tier calculations for each gig to prevent unnecessary recalculations
  const gigBonusTiers = useMemo(() => {
    return mockGigs.reduce((acc, gig) => {
      acc[gig.id] = getGigBonusTiers(gig)
      return acc
    }, {} as Record<number, ReturnType<typeof calculateEventBonusTiers>>)
  }, [mockGigs, getGigBonusTiers])

  const getCurrentTier = useCallback((gig: (typeof mockGigs)[0]) => {
    // Use memoized bonus tiers if available
    const bandTiers = gigBonusTiers[gig.id]
    if (bandTiers && bandTiers.length > 0) {
      return bandTiers[0].currentTier
    }
    
    // Fallback to old system if no bands or memoized data not available
    if (gig.ticketsSold >= gig.tier3.threshold) return { ...gig.tier3, name: "Tier 3" }
    if (gig.ticketsSold >= gig.tier2.threshold) return { ...gig.tier2, name: "Tier 2" }
    if (gig.ticketsSold >= gig.tier1.threshold) return { ...gig.tier1, name: "Tier 1" }
    return { amount: gig.guarantee, threshold: 0, color: "bg-gray-500", name: "Guarantee" }
  }, [gigBonusTiers])

  if (selectedGig) {
    const gig = mockGigs.find(g => g.id.toString() === selectedGig)
    return <GigDetails gigId={selectedGig} onBack={() => setSelectedGig(null)} gigData={gig} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image src="/images/venu-logo.png" alt="Venu" width={32} height={32} className="rounded-lg w-8 h-8" />
            <span className="font-serif font-bold text-xl">Artist Dashboard</span>
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
        <TabsList className="w-full grid grid-cols-5 bg-card border-b border-border rounded-none h-12">
          <TabsTrigger
            value="discover"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="applications"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger
            value="more"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2"
          >
            <MoreHorizontal className="h-4 w-4" />
            More
          </TabsTrigger>
        </TabsList>

        {/* Discover Gigs Tab */}
        <TabsContent value="discover" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
                            <h2 className="font-serif font-bold text-xl">Trending locations near you</h2>
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
                        alt={gig.location}
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
                        <h3 className="font-semibold text-foreground">{getLocationDisplayName(gig.location)}</h3>
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

                      {/* Dynamic Payout Tiers */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-foreground">Payout Tiers (${gig.ticketPrice}/ticket)</div>
                        
                        {gig.bands && gig.bands.length > 0 ? (
                          gig.bands.map((band) => {
                            const bandTiers = gigBonusTiers[gig.id]?.find(bt => bt.bandId === band.id)
                            
                            if (!bandTiers) return null
                            
                            return (
                              <div key={band.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">{band.name} ({band.percentage}%)</span>
                                  <span className="text-foreground font-medium">${bandTiers.currentEarnings}</span>
                                </div>
                                
                                <div className="space-y-1">
                                  <Progress value={progress} className="h-2" />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Guarantee: ${band.guarantee}</span>
                                    <span>Current: ${Math.round(bandTiers.currentEarnings)}</span>
                                  </div>
                                </div>

                                {/* Dynamic Tier indicators */}
                                <div className="flex flex-wrap gap-1">
                                  {bandTiers.tiers.slice(1).map((tier, index) => (
                                    <div key={index} className="flex items-center gap-1 text-xs">
                                      <div className={`w-2 h-2 rounded-full ${tier.color}`} />
                                      <span>{tier.threshold}+ tickets = ${tier.amount}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No bands configured for this event
                          </div>
                        )}
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
                          variant="purple"
                          size="sm"
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

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">My Schedule</h2>
          </div>

          <div className="space-y-4">
            {myBookings.map((booking) => (
              <Card key={booking.id} className="p-4 bg-card border-border">
                <div className="flex gap-4">
                  <Image
                    src={booking.image || "/images/venu-logo.png"}
                    alt={booking.location}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover w-20 h-20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{getLocationDisplayName(booking.location)}</h3>
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

        {/* Applications Tab */}
        <TabsContent value="applications" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">My Applications</h2>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex gap-4">
                <Image
                  src="/images/MUGS.jpeg"
                  alt="Muggy's"
                  width={60}
                  height={60}
                  className="rounded-lg object-cover w-15 h-15"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Muggy's</h3>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Pending
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Applied for: Rock Night - Oct 12
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Applied 2 days ago
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex gap-4">
                <Image
                  src="/images/SARBEZ.jpg"
                  alt="Sarbez"
                  width={60}
                  height={60}
                  className="rounded-lg object-cover w-15 h-15"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Sarbez</h3>
                    <Badge variant="default" className="bg-green-600">
                      Accepted
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Applied for: Rock Show - Oct 16
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Accepted 1 week ago
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">Venue Chat</h2>
          </div>

          <Card className="p-4 bg-card border-border">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">JD</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">John Doe - Muggy's</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm text-foreground">
                        Hey! Just wanted to confirm the sound check time for tomorrow's show. 
                        Can we get in at 6 PM?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div className="flex-1 max-w-xs">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className="text-xs text-muted-foreground">1 hour ago</span>
                      <span className="text-sm font-medium text-foreground">You</span>
                    </div>
                    <div className="bg-purple-600 text-white rounded-lg p-3">
                      <p className="text-sm">
                        Absolutely! 6 PM works perfectly. The sound system will be ready and tested by then.
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">A</span>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-border pt-4">
                <div className="flex gap-2">
                  <input
                    placeholder="Type your message..."
                    className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm"
                  />
                  <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* More Tab */}
        <TabsContent value="more" className="p-4 space-y-6">
          <h2 className="font-serif font-bold text-xl">More</h2>
          
          {/* Earnings Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Earnings Tracker</h3>
            <Card className="p-6 bg-card border-border">
              <div className="text-center space-y-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">${totalEarnings}</div>
                    <div className="text-sm text-muted-foreground">of ${goalAmount} goal</div>
                    <div className="text-xs text-primary font-medium">{Math.round(progressPercentage)}%</div>
                  </div>
                  
                  {/* Progress bar using shadcn/ui Progress component */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress to goal</span>
                      <span>{Math.round(Math.min(progressPercentage, 100))}%</span>
                    </div>
                    <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
                  </div>
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
          </div>

          {/* Promotion Tools Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Promotion Tools</h3>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
