"use client"

import { useState, useMemo, useCallback, memo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, FileText, MessageCircle, MoreHorizontal, Filter, MapPin, Star, Share2, TrendingUp, BarChart3, ArrowLeft, ArrowRight } from "lucide-react"
import Image from "next/image"
import { GigDetails } from "./gig-details"
import { getLocationDisplayName } from "@/lib/location-data"
import { calculateEventBonusTiers } from "@/lib/bonus-tiers"
import { RealTimeNotifications } from "./real-time-notifications"
import { RealTimeGigUpdates } from "./real-time-gig-updates"
import { RealTimeChat } from "./real-time-chat"
import { useSocket } from "@/lib/socket"
import { useArtistRealTime } from "@/hooks/useArtistRealTime"

// Types for better type safety
interface Gig {
  id: number
  location: string
  address: string
  date: string
  time: string
  genre: string
  guarantee: number
  ticketPrice: number
  tier1: { amount: number; threshold: number; color: string }
  tier2: { amount: number; threshold: number; color: string }
  tier3: { amount: number; threshold: number; color: string }
  ticketsSold: number
  totalTickets: number
  rating: number
  requirements: string[]
  image: string
  bands: Array<{
    id: string
    name: string
    genre: string
    setTime: string
    percentage: number
    email: string
    guarantee: number
  }>
}

interface Booking {
  id: number
  location: string
  date: string
  time: string
  status: "confirmed" | "completed"
  ticketsSold: number
  totalTickets: number
  earnings: number
  image: string
}

// Memoized Gig Card Component for better performance
const GigCard = memo(function GigCard({ 
  gig, 
  gigBonusTiers, 
  onSelectGig,
  onBookGig
}: { 
  gig: Gig
  gigBonusTiers: Record<number, ReturnType<typeof calculateEventBonusTiers>>
  onSelectGig: (gigId: string) => void
  onBookGig: (gigId: string, gigData: Record<string, unknown>) => void
}) {
  const progress = useMemo(() => (gig.ticketsSold / gig.totalTickets) * 100, [gig.ticketsSold, gig.totalTickets])

  return (
    <Card className="p-4 bg-card border-border">
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
              onClick={() => onSelectGig(gig.id.toString())}
            >
              See Checklist
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                onSelectGig(gig.id.toString())
                // Send real-time gig update for booking confirmation
                onBookGig(gig.id.toString(), {
                  name: getLocationDisplayName(gig.location),
                  status: "booking-requested",
                  artistId: "artist-123",
                  date: gig.date,
                  time: gig.time
                })
              }}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
})

export function ArtistDashboard() {
  const [activeTab, setActiveTab] = useState("discover")
  const [selectedGig, setSelectedGig] = useState<string | null>(null)
  
  // Socket connection for real-time features
  const { autoConnect } = useSocket()
  
  // Artist-specific real-time features
  const {
    notifications,
    gigUpdates,
    sendGigUpdate,
    isConnected: realTimeConnected
  } = useArtistRealTime({ artistId: "artist-123" })
  
  // Auto-connect socket when component mounts
  useEffect(() => {
    autoConnect().catch((err) => {
      console.error('Failed to auto-connect socket:', err)
    })
  }, [autoConnect])
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Schedule tab subcategory state
  const [scheduleSubcategory, setScheduleSubcategory] = useState("list")
  
  // Filter state for schedule views
  const [scheduleFilter, setScheduleFilter] = useState("all") // "all", "confirmed", "completed", "upcoming"
  
  // Availability filter state (separate from booking status filters)
  const [availabilityFilter, setAvailabilityFilter] = useState("all") // "all", "unavailable", "available"
  
  // Unavailable dates state (dates when artist is unavailable)
  const [unavailableDates, setUnavailableDates] = useState<string[]>(() => {
    // Load from localStorage or use default values
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('artist-unavailable-dates')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          // Failed to parse saved unavailable dates, using defaults
        }
      }
    }
    // Default unavailable dates for current month
    return [
      "2024-12-01",
      "2024-12-08", 
      "2024-12-25"
    ]
  })
  
  // Earnings data - memoized for performance
  const earningsData = useMemo(() => {
    const totalEarnings = 620
    const goalAmount = 300
    const progressPercentage = (totalEarnings / goalAmount) * 100
    return { totalEarnings, goalAmount, progressPercentage }
  }, [])

  // Real gigs data - replace with API call
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real gigs from API
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true)
        const response = await gigApi.getGigsByArtist('current-artist-id') // Replace with actual artist ID
        if (response.success && response.data) {
          setGigs(response.data)
        } else {
          setError(response.error || 'Failed to load gigs')
        }
      } catch (err) {
        console.error('Error fetching gigs:', err)
        setError('Failed to load gigs')
      } finally {
        setLoading(false)
      }
    }

    fetchGigs()
  }, [])

  const mockGigs = useMemo((): Gig[] => [
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

  const myBookings = useMemo((): Booking[] => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
    
    return [
      {
        id: 1,
        location: "muggys", // Use standardized location key
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
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
        date: `${currentYear}-${String(currentMonth - 1).padStart(2, '0')}-28`,
        time: "7 PM",
        status: "completed",
        ticketsSold: 45,
        totalTickets: 60,
        earnings: 350,
        image: "/images/SARBEZ.jpg",
      },
    ];
  }, [])

  // const calculateProgress = useCallback((sold: number, total: number) => (sold / total) * 100, [])

  // Calculate dynamic bonus tiers for each gig - memoized for performance
  const getGigBonusTiers = useCallback((gig: Gig) => {
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

  // Remove unused getCurrentTier function
  // const getCurrentTier = useCallback((gig: Gig) => {
  //   // Use memoized bonus tiers if available
  //   const bandTiers = gigBonusTiers[gig.id]
  //   if (bandTiers && bandTiers.length > 0) {
  //     return bandTiers[0].currentTier
  //   }
  //   
  //   // Fallback to old system if no bands or memoized data not available
  //   if (gig.ticketsSold >= gig.tier3.threshold) return { ...gig.tier3, name: "Tier 3" }
  //   if (gig.ticketsSold >= gig.tier2.threshold) return { ...gig.tier2, name: "Tier 2" }
  //   if (gig.ticketsSold >= gig.tier1.threshold) return { ...gig.tier1, name: "Tier 1" }
  //   return { amount: gig.guarantee, threshold: 0, color: "bg-gray-500", name: "Guarantee" }
  // }, [gigBonusTiers])

  // Calendar navigation functions
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }, [])

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  // Toggle date availability
  const toggleDateAvailability = useCallback((dateString: string) => {
    setUnavailableDates(prevDates => {
      let newDates: string[]
      if (prevDates.includes(dateString)) {
        // Remove from unavailable dates (make available)
        newDates = prevDates.filter(date => date !== dateString)
      } else {
        // Add to unavailable dates (make unavailable)
        newDates = [...prevDates, dateString]
      }
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('artist-unavailable-dates', JSON.stringify(newDates))
      }
      
      return newDates
    })
  }, [])

  // Filter bookings based on selected filter
  const filteredBookings = useMemo(() => {
    let filtered = myBookings;
    
    // Apply booking status filter
    if (scheduleFilter !== "all") {
      filtered = filtered.filter(booking => {
        switch (scheduleFilter) {
          case "confirmed":
            return booking.status === "confirmed";
          case "completed":
            return booking.status === "completed";
          case "upcoming":
            return booking.status === "confirmed" && new Date(booking.date) > new Date();
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [myBookings, scheduleFilter])

  if (selectedGig) {
    const gig = mockGigs.find(g => g.id.toString() === selectedGig)
    if (gig) {
      // Transform the data structure to match GigDetails interface
      const transformedGig = {
        id: gig.id,
        location: gig.location,
        date: gig.date,
        time: gig.time,
        genre: gig.genre,
        guarantee: gig.guarantee,
        tiers: [
          { threshold: gig.tier1.threshold, amount: gig.tier1.amount, label: `${gig.tier1.threshold} tickets = $${gig.tier1.amount}`, color: gig.tier1.color },
          { threshold: gig.tier2.threshold, amount: gig.tier2.amount, label: `${gig.tier2.threshold} tickets = $${gig.tier2.amount}`, color: gig.tier2.color },
          { threshold: gig.tier3.threshold, amount: gig.tier3.amount, label: `${gig.tier3.threshold} tickets = $${gig.tier3.amount}`, color: gig.tier3.color },
        ],
        ticketsSold: gig.ticketsSold,
        totalTickets: gig.totalTickets,
        rating: gig.rating,
        reviews: 127, // Default value
        checklist: gig.requirements.map((req, index) => ({
          id: index + 1,
          item: req,
          completed: true,
          type: "location" as const
        }))
      }
      return <GigDetails gigId={selectedGig} onBack={() => setSelectedGig(null)} gigData={transformedGig} />
    }
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
            {/* Real-time gig updates for booking confirmations */}
            <RealTimeGigUpdates locationId="artist-dashboard" />
            {/* Real-time notifications */}
            <RealTimeNotifications />
            {/* Connection status indicator */}
            <div className="flex items-center gap-1 text-xs">
              <div className={`w-2 h-2 rounded-full ${realTimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-muted-foreground">
                {realTimeConnected ? 'Live' : 'Offline'}
              </span>
            </div>
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
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MapPin className="w-4 h-4 mr-1" />
                Filter
              </Button>
              {/* Real-time new gig opportunities indicator */}
              {gigUpdates.filter(u => u.updateType === 'created').length > 0 && (
                <Badge variant="default" className="bg-orange-600 text-white">
                  {gigUpdates.filter(u => u.updateType === 'created').length} new gig{gigUpdates.filter(u => u.updateType === 'created').length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {mockGigs.map((gig) => (
              <GigCard
                key={gig.id}
                gig={gig}
                gigBonusTiers={gigBonusTiers}
                onSelectGig={setSelectedGig}
                onBookGig={(gigId, gigData) => {
                  sendGigUpdate(gigId, "status-changed", gigData)
                }}
              />
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">My Schedule</h2>
            {/* Real-time booking confirmations indicator */}
            {notifications.filter(n => n.type === 'booking-request' && !n.read).length > 0 && (
              <Badge variant="default" className="bg-green-600 text-white">
                {notifications.filter(n => n.type === 'booking-request' && !n.read).length} new booking{notifications.filter(n => n.type === 'booking-request' && !n.read).length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Schedule Subcategory Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button 
              variant={scheduleSubcategory === "list" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleSubcategory("list")}
              className={`whitespace-nowrap ${scheduleSubcategory === "list" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              List View
            </Button>
            <Button 
              variant={scheduleSubcategory === "calendar" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleSubcategory("calendar")}
              className={`whitespace-nowrap ${scheduleSubcategory === "calendar" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Calendar View
            </Button>
          </div>

          {/* Filter Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button 
              variant={scheduleFilter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleFilter("all")}
              className={`whitespace-nowrap ${scheduleFilter === "all" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
            >
              All Bookings
            </Button>
            <Button 
              variant={scheduleFilter === "confirmed" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleFilter("confirmed")}
              className={`whitespace-nowrap ${scheduleFilter === "confirmed" ? "bg-green-600 hover:bg-green-700 text-white" : "border-green-200 text-green-700 hover:bg-green-50"}`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Confirmed
            </Button>
            <Button 
              variant={scheduleFilter === "completed" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleFilter("completed")}
              className={`whitespace-nowrap ${scheduleFilter === "completed" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-blue-200 text-blue-700 hover:bg-blue-50"}`}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
              Completed
            </Button>
            <Button 
              variant={scheduleFilter === "upcoming" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleFilter("upcoming")}
              className={`whitespace-nowrap ${scheduleFilter === "upcoming" ? "bg-orange-600 hover:bg-orange-700 text-white" : "border-orange-200 text-orange-700 hover:bg-orange-50"}`}
            >
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
              Upcoming
            </Button>
          </div>

          {/* Availability Filter Navigation (separate from booking status filters) */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button 
              variant={availabilityFilter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setAvailabilityFilter("all")}
              className={`whitespace-nowrap ${availabilityFilter === "all" ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-purple-200 text-purple-700 hover:bg-purple-50"}`}
            >
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
              All Dates
            </Button>
            <Button 
              variant={availabilityFilter === "unavailable" ? "default" : "outline"} 
              size="sm"
              onClick={() => setAvailabilityFilter("unavailable")}
              className={`whitespace-nowrap ${availabilityFilter === "unavailable" ? "bg-red-600 hover:bg-red-700 text-white" : "border-red-200 text-red-700 hover:bg-red-50"}`}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              Unavailable
            </Button>
            <Button 
              variant={availabilityFilter === "available" ? "default" : "outline"} 
              size="sm"
              onClick={() => setAvailabilityFilter("available")}
              className={`whitespace-nowrap ${availabilityFilter === "available" ? "bg-gray-600 hover:bg-gray-700 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
              Available
            </Button>
          </div>

          {/* List View Subcategory */}
          {scheduleSubcategory === "list" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-foreground">My Bookings</h3>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredBookings.length} of {myBookings.length} bookings
                </div>
              </div>

              {/* Color Key Legend for List View */}
              <Card className="p-4 bg-card border-border">
                <h4 className="font-medium text-foreground mb-3">Booking Status Legend</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-muted-foreground">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-muted-foreground">Completed</span>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className={`p-4 bg-card ${
                    booking.status === "confirmed" 
                      ? 'border-green-200 border-2' 
                      : 'border-blue-200 border-2'
                  }`}>
                    <div className="flex items-start gap-4">
                      <Image
                        src={booking.image || "/images/venu-logo.png"}
                        alt={booking.location}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{getLocationDisplayName(booking.location)}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(booking.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })} • {booking.time}
                            </div>
                          </div>
                          <Badge 
                            variant={booking.status === "confirmed" ? "default" : "secondary"}
                            className={booking.status === "confirmed" ? "bg-green-600" : "bg-blue-600"}
                          >
                            {booking.status}
                          </Badge>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex items-center gap-2 mb-3">
                          {booking.status === "confirmed" ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Upcoming Performance
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Performance Completed
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Tickets Sold:</span>
                            <div className="font-medium text-foreground">
                              {booking.ticketsSold}/{booking.totalTickets}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Earnings:</span>
                            <div className="font-medium text-green-400">${booking.earnings}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="default" size="sm" className="w-28 bg-purple-600 hover:bg-purple-700 text-white">
                            View Details
                          </Button>
                          <Button variant="default" size="sm" className="w-24 bg-purple-600 hover:bg-purple-700 text-white">
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Calendar View Subcategory */}
          {scheduleSubcategory === "calendar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-foreground">Calendar View</h3>
                <div className="text-sm text-muted-foreground">
                  {availabilityFilter === "unavailable" 
                    ? `Showing ${unavailableDates.length} unavailable dates`
                    : availabilityFilter === "available"
                    ? `Showing available dates`
                    : availabilityFilter === "all"
                    ? `Showing all dates (available and unavailable)`
                    : `Showing ${filteredBookings.length} of ${myBookings.length} bookings`
                  }
                </div>
              </div>

              {/* Calendar Grid */}
              <Card className="p-6 bg-card border-border">
                {/* Navigation Controls */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Button 
                    variant="default" 
                    size="lg" 
                    onClick={goToPreviousMonth} 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 min-w-[60px] min-h-[48px] touch-manipulation"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                  <Button 
                    variant="default" 
                    size="lg" 
                    onClick={goToToday}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-base font-medium min-h-[48px] touch-manipulation"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Today
                  </Button>
                  <Button 
                    variant="default" 
                    size="lg" 
                    onClick={goToNextMonth} 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 min-w-[60px] min-h-[48px] touch-manipulation"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                </div>
                
                {/* Month/Year Header */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click on available dates to mark them as unavailable
                  </p>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {/* Generate calendar days for current month */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 3; // Start from previous month to fill first week
                    const today = new Date();
                    const currentMonth = currentDate.getMonth();
                    const currentYear = currentDate.getFullYear();
                    
                    // Check if this date has a booking (considering filter)
                    const bookingOnDate = filteredBookings.find(booking => {
                      const bookingDate = new Date(booking.date);
                      return bookingDate.getDate() === day && 
                             bookingDate.getMonth() === currentMonth && 
                             bookingDate.getFullYear() === currentYear;
                    });
                    
                    // Check if date is unavailable
                    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isUnavailable = unavailableDates.includes(dateString);
                    
                    // Check if date is in the past
                    const isPast = day < 1 || (day < today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear());
                    
                    // Check if date is today
                    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                    
                    // Check if date is in current month
                    const isCurrentMonth = day >= 1 && day <= new Date(currentYear, currentMonth + 1, 0).getDate();
                    
                    // For unavailable filter, only show unavailable days
                    if (availabilityFilter === "unavailable" && !isUnavailable) {
                      return <div key={i} className="h-20 bg-muted/20 rounded-lg"></div>;
                    }
                    
                    // For available filter, only show available days (no bookings, not unavailable, not past)
                    if (availabilityFilter === "available" && (bookingOnDate || isUnavailable || isPast)) {
                      return <div key={i} className="h-20 bg-muted/20 rounded-lg"></div>;
                    }
                    
                    if (!isCurrentMonth) {
                      return <div key={i} className="h-20 bg-muted/20 rounded-lg"></div>;
                    }
                    
                    return (
                      <div 
                        key={i} 
                        onClick={() => {
                          // Only allow toggling availability for future dates that don't have bookings
                          if (!isPast && !bookingOnDate) {
                            toggleDateAvailability(dateString)
                          }
                        }}
                        className={`h-20 p-2 rounded-lg border transition-all duration-200 ${
                          !isPast && !bookingOnDate 
                            ? 'cursor-pointer hover:shadow-md' 
                            : 'cursor-default'
                        } ${
                          isToday 
                            ? 'bg-purple-600 border-purple-600 shadow-md' 
                            : isUnavailable
                            ? availabilityFilter === "unavailable"
                              ? 'bg-red-50 border-red-300 shadow-md' 
                              : 'bg-white border-red-200'
                            : bookingOnDate && bookingOnDate.status === "confirmed"
                            ? 'bg-white border-green-200' 
                            : bookingOnDate && bookingOnDate.status === "completed"
                            ? 'bg-white border-blue-200'
                            : isPast 
                            ? 'bg-white border-muted' 
                            : 'bg-white border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 relative z-10 ${
                          isToday 
                            ? 'text-white' 
                            : isUnavailable
                            ? availabilityFilter === "unavailable"
                              ? 'text-red-700 font-bold'
                              : 'text-red-600'
                            : bookingOnDate && bookingOnDate.status === "confirmed"
                            ? 'text-green-600' 
                            : bookingOnDate && bookingOnDate.status === "completed"
                            ? 'text-blue-600'
                            : isPast 
                            ? 'text-muted-foreground' 
                            : 'text-gray-900 font-semibold'
                        }`}>
                          {day}
                        </div>
                        
                        {bookingOnDate && (
                          <div className="space-y-1 max-h-12 overflow-hidden">
                            <div 
                              className={`text-xs p-1 rounded truncate ${
                                bookingOnDate.status === "confirmed"
                                  ? 'bg-green-200 text-green-800' 
                                  : 'bg-blue-200 text-blue-800'
                              }`}
                            >
                              <div className="font-medium truncate" title={getLocationDisplayName(bookingOnDate.location)}>
                                {getLocationDisplayName(bookingOnDate.location)}
                              </div>
                              <div className="text-xs font-bold mt-0.5 truncate">
                                {bookingOnDate.status === "confirmed" ? "Confirmed" : "Completed"}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {!bookingOnDate && !isPast && !isUnavailable && (
                          <div className={`text-xs mt-1 font-medium ${
                            isToday ? 'text-white' : 'text-gray-600'
                          }`}>
                            Available
                          </div>
                        )}
                        
                        {!bookingOnDate && !isPast && isUnavailable && (
                          <div className={`text-xs mt-2 font-medium ${
                            isToday 
                              ? 'text-white'
                              : availabilityFilter === "unavailable"
                              ? 'text-red-700 font-bold'
                              : 'text-red-600'
                          }`}>
                            Unavailable
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Legend */}
              <Card className="p-4 bg-card border-border">
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-foreground mb-2">Calendar Legend</h4>
                  <p className="text-xs text-muted-foreground">
                    Click on available dates (white with gray border) to toggle availability
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-300 rounded"></div>
                    <span className="text-purple-600 font-medium">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 rounded"></div>
                    <span className="text-green-600 font-medium">Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 rounded"></div>
                    <span className="text-blue-600 font-medium">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-200 rounded"></div>
                    <span className="text-red-600 font-medium">Date Unavailable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span className="text-muted-foreground">Past</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span className="text-black font-medium">Available (Clickable)</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">My Applications</h2>
            {/* Real-time application updates indicator */}
            {gigUpdates.length > 0 && (
              <Badge variant="default" className="bg-purple-600 text-white">
                {gigUpdates.length} new update{gigUpdates.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex gap-4">
                <Image
                  src="/images/MUGS.jpeg"
                  alt="Muggy&apos;s"
                  width={60}
                  height={60}
                  className="rounded-lg object-cover w-15 h-15"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Muggy&apos;s</h3>
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
            {/* Real-time new messages indicator */}
            {notifications.filter(n => n.type === 'message' && !n.read).length > 0 && (
              <Badge variant="default" className="bg-blue-600 text-white">
                {notifications.filter(n => n.type === 'message' && !n.read).length} new message{notifications.filter(n => n.type === 'message' && !n.read).length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Real-time chat for communication with promoters */}
          <RealTimeChat 
            locationId="artist-dashboard" 
            currentUserId="artist-123"
            className="h-96"
          />
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
                    <div className="text-2xl font-bold text-foreground">${earningsData.totalEarnings}</div>
                    <div className="text-sm text-muted-foreground">of ${earningsData.goalAmount} goal</div>
                    <div className="text-xs text-primary font-medium">{Math.round(earningsData.progressPercentage)}%</div>
                  </div>
                  
                  {/* Progress bar using shadcn/ui Progress component */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress to goal</span>
                      <span>{Math.round(Math.min(earningsData.progressPercentage, 100))}%</span>
                    </div>
                    <Progress value={Math.min(earningsData.progressPercentage, 100)} className="h-3" />
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
