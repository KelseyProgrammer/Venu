"use client"

import { useState, useMemo, useCallback, memo, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Search, Calendar, FileText, MessageCircle, MoreHorizontal, Filter, 
  MapPin, Star, Share2, TrendingUp, BarChart3, ArrowLeft, ArrowRight, 
  User, LogOut, Clock, Music, CheckCircle
} from "lucide-react"
import Image from "next/image"
import { GigDetails } from "./gig-details"
import { getLocationDisplayName } from "@/lib/location-data"
import { calculateEventBonusTiers } from "@/lib/bonus-tiers"
import { RealTimeNotifications } from "./real-time-notifications"
import { RealTimeGigUpdates } from "./real-time-gig-updates"
import { RealTimeChat } from "./real-time-chat"
import { useSocket } from "@/lib/socket"
import { useArtistRealTime } from "@/hooks/useArtistRealTime"
import { authUtils } from "@/lib/utils"
import { gigApi } from "@/lib/api"
import { ProfileManagement } from "@/components/ui/profile-management"
import { SimpleProfileUpload } from "@/components/ui/simple-profile-upload"

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
  status: "confirmed" | "pending" | "completed"
  ticketsSold: number
  totalTickets: number
  earnings: number
  image: string
  gigId?: string
  eventName?: string
  genre?: string
  artistSetTime?: string
  artistPercentage?: number
  artistGuarantee?: number
  isPast?: boolean
}

// Artist Event Details Modal Component
interface ArtistEventDetailsModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
}

function ArtistEventDetailsModal({ booking, isOpen, onClose }: ArtistEventDetailsModalProps) {
  if (!booking) return null

  const progress = (booking.ticketsSold / booking.totalTickets) * 100

  // Helper function to convert 24-hour time to 12-hour format
  const formatTime12Hour = (time24: string): string => {
    try {
      const time = time24.trim()
      
      if (time.includes('AM') || time.includes('PM')) {
        return time
      }
      
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours, 10)
        const minute = parseInt(minutes, 10)
        
        if (isNaN(hour) || isNaN(minute)) {
          return time24
        }
        
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        
        return `${displayHour}:${minutes.padStart(2, '0')} ${period}`
      }
      
      const hour = parseInt(time, 10)
      if (!isNaN(hour) && hour >= 0 && hour <= 23) {
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        
        return `${displayHour}:00 ${period}`
      }
      
      return time24
    } catch {
      return time24
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {booking.eventName || getLocationDisplayName(booking.location)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Header */}
          <div className="flex items-start gap-4">
            <Image
              src={booking.image || "/images/BandFallBack.PNG"}
              alt={booking.eventName || "Event"}
              width={120}
              height={120}
              className="rounded-lg object-cover"
            />
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(booking.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{formatTime12Hour(booking.time)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {getLocationDisplayName(booking.location)}
                </span>
              </div>
              
              {booking.genre && (
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    {booking.genre}
                  </Badge>
                </div>
              )}
              
              <Badge 
                variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'outline'}
                className={`text-xs ${
                  booking.status === "confirmed" 
                    ? "bg-green-600" 
                    : booking.status === "pending"
                    ? "bg-yellow-600"
                    : booking.isPast
                    ? "bg-blue-600"
                    : "bg-gray-600"
                }`}
              >
                {booking.status === "confirmed" 
                  ? "Confirmed" 
                  : booking.status === "pending"
                  ? "Needs Band"
                  : booking.isPast
                  ? "Past Show"
                  : booking.status
                }
              </Badge>
            </div>
          </div>

          {/* Event Stats */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4">Event Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{booking.ticketsSold}</div>
                <div className="text-sm text-muted-foreground">Tickets Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{booking.totalTickets}</div>
                <div className="text-sm text-muted-foreground">Total Capacity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">${booking.artistGuarantee || 0}</div>
                <div className="text-sm text-muted-foreground">Your Guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">${booking.earnings}</div>
                <div className="text-sm text-muted-foreground">Your Earnings</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Ticket Sales Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Your Performance Details */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4">Your Performance Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Your Set</div>
                  <div className="text-sm text-muted-foreground">
                    {booking.genre || "TBD"} • {booking.artistSetTime ? formatTime12Hour(booking.artistSetTime) : "TBD"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {booking.artistPercentage || 0}%
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Details */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Your Percentage:</span>
                <div className="font-medium text-foreground">{booking.artistPercentage || 0}% of revenue</div>
              </div>
              <div>
                <span className="text-muted-foreground">Your Guarantee:</span>
                <div className="font-medium text-foreground">${booking.artistGuarantee || 0}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Current Earnings:</span>
                <div className="font-medium text-green-400">${booking.earnings}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="font-medium text-foreground">
                  {booking.status === "confirmed" 
                    ? "Confirmed" 
                    : booking.status === "pending"
                    ? "Needs Band"
                    : booking.isPast
                    ? "Past Show"
                    : booking.status
                  }
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="default" 
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
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
  const progress = useMemo(() => (gig.ticketsSold / gig.totalTickets) * 100, [gig.ticketsSold, gig.totalTickets, gig])
  
  // Memoize band tiers calculation to prevent unnecessary recalculations
  const bandTiers = useMemo(() => {
    if (!gig.bands || !gigBonusTiers[gig.id]) return []
    
    return gig.bands
      .map((band) => {
        const bandTiers = gigBonusTiers[gig.id]?.find(bt => bt.bandId === band.id)
        return bandTiers ? { band, bandTiers } : null
      })
      .filter((item): item is { band: typeof gig.bands[0], bandTiers: NonNullable<typeof gigBonusTiers[number][0]> } => item !== null)
  }, [gig.bands, gigBonusTiers, gig.id])

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
              priority={false}
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
            
                        {bandTiers.length > 0 ? (
              bandTiers.map(({ band, bandTiers: tiers }) => (
                <div key={band.id} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{band.name} ({band.percentage}%)</span>
                    <span className="text-foreground font-medium">${tiers.currentEarnings}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Guarantee: ${band.guarantee}</span>
                      <span>Current: ${Math.round(tiers.currentEarnings)}</span>
                    </div>
                  </div>

                  {/* Dynamic Tier indicators */}
                  <div className="flex flex-wrap gap-1">
                    {tiers.tiers.slice(1).map((tier, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs">
                        <div className={`w-2 h-2 rounded-full ${tier.color}`} />
                        <span>{tier.threshold}+ tickets = ${tier.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
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
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [profileImage, setProfileImage] = useState<string>("")
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false)
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<Booking | null>(null)
  
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
      setError('Failed to connect to real-time services')
    })
  }, [autoConnect])
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Schedule tab subcategory state
  const [scheduleSubcategory, setScheduleSubcategory] = useState("list")
  
  // Filter state for schedule views
  const [scheduleFilter, setScheduleFilter] = useState("all") // "all", "confirmed", "needs-band", "past"
  
  // Availability filter state (separate from booking status filters)
  const [availabilityFilter, setAvailabilityFilter] = useState("all") // "all", "unavailable", "available"
  
  // Available dates state (dates when artist is explicitly marked as available)
  const [availableDates, setAvailableDates] = useState<string[]>(() => {
    // Load from localStorage or use default values
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('artist-available-dates')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          // Failed to parse saved available dates, using defaults
        }
      }
    }
    // Start with empty array - days are blank by default
    return []
  })

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
    // Start with empty array - days are blank by default
    return []
  })
  
  // Earnings data - memoized for performance
  const earningsData = useMemo(() => {
    const totalEarnings = 620
    const goalAmount = 300
    const progressPercentage = (totalEarnings / goalAmount) * 100
    return { totalEarnings, goalAmount, progressPercentage }
  }, [])

  // Artist profile data - memoized for performance
  const artistProfileData = useMemo(() => {
    // Only get user data on the client side to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return {
        name: "Artist",
        profileImage: "/images/SARBEZ.jpg",
        email: "artist@example.com",
        phone: "+1 (555) 123-4567",
        instagram: "@artistmusic",
        setLength: "45 minutes",
        equipment: "PA system provided",
        soundRequirements: "2 vocal mics, 1 guitar DI",
        status: "Available for bookings",
        preferredDays: ["Friday", "Saturday"],
        leadTime: "2 weeks notice"
      }
    }
    
    const currentUser = authUtils.getCurrentUser();
    
    return {
      name: currentUser ? authUtils.getUserFullName() : "Artist",
      profileImage: currentUser?.profileImage || "/images/SARBEZ.jpg",
      email: currentUser?.email || "artist@example.com",
      phone: "+1 (555) 123-4567",
      instagram: "@artistmusic",
      setLength: "45 minutes",
      equipment: "PA system provided",
      soundRequirements: "2 vocal mics, 1 guitar DI",
      status: "Available for bookings",
      preferredDays: ["Friday", "Saturday"],
      leadTime: "2 weeks notice"
    }
  }, [])

  const { name: artistName, profileImage: artistProfileImage } = artistProfileData

  // State to track if we're on the client side
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(true)
  const [artistGigs, setArtistGigs] = useState<any[]>([])

  // Set isClient to true after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch artist gigs from API
  useEffect(() => {
    const fetchArtistGigs = async () => {
      try {
        setLoading(true)
        const currentUser = authUtils.getCurrentUser()
        if (!currentUser?.email) {
          console.error('No user email found')
          return
        }

        const response = await gigApi.getGigsByArtist(currentUser.email, 1, 100)
        if (response.success && response.data) {
          setArtistGigs(response.data)
        } else {
          console.error('Failed to fetch artist gigs:', response.error)
        }
      } catch (err) {
        console.error('Error fetching artist gigs:', err)
      } finally {
        setLoading(false)
      }
    }

    if (isClient) {
      fetchArtistGigs()
    }
  }, [isClient])

  // Remove unused state variables since we're using mock data
  // const [gigs, setGigs] = useState<Gig[]>([])
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState<string | null>(null)

  // Fetch real gigs from API - commented out since we're using mock data
  // useEffect(() => {
  //   const fetchGigs = async () => {
  //     try {
  //       setLoading(true)
  //       const response = await gigApi.getGigsByArtist('current-artist-id') // Replace with actual artist ID
  //       if (response.success && response.data) {
  //         setGigs(response.data)
  //       } else {
  //         setError(response.error || 'Failed to load gigs')
  //       }
  //     } catch (err) {
  //       console.error('Error fetching gigs:', err)
  //       setError('Failed to load gigs')
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchGigs()
  // }, [])

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
    if (!artistGigs.length) return []

    return artistGigs.map((gig, index) => {
      const artistBand = gig.artistBand
      const location = gig.selectedLocation
      
      // Check if the event is in the past
      const eventDate = new Date(gig.eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const isPast = eventDate < today
      
      // Determine status based on gig status, artist confirmation, and date
      let status: "confirmed" | "pending" | "completed" = "pending"
      if (isPast) {
        status = "completed" // Past shows are always considered completed
      } else if (gig.status === "completed") {
        status = "completed"
      } else if (artistBand?.confirmed) {
        status = "confirmed"
      }

      // Calculate earnings based on artist percentage
      const totalRevenue = (gig.ticketsSold || 0) * (gig.ticketPrice || 0)
      const artistEarnings = totalRevenue * ((artistBand?.percentage || 0) / 100)

      return {
        id: index + 1,
        location: location?.name?.toLowerCase().replace(/\s+/g, '') || "unknown",
        date: gig.eventDate,
        time: gig.eventTime,
        status,
        ticketsSold: gig.ticketsSold || 0,
        totalTickets: gig.ticketCapacity || 0,
        earnings: Math.round(artistEarnings),
        image: gig.image || "/images/BandFallBack.PNG",
        gigId: gig._id || gig.id,
        eventName: gig.eventName,
        genre: gig.eventGenre,
        artistSetTime: artistBand?.setTime,
        artistPercentage: artistBand?.percentage,
        artistGuarantee: artistBand?.guarantee || 0,
        isPast
      }
    })
  }, [artistGigs])

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

  // Calendar navigation functions - optimized with useCallback
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

  // Handle single click toggle - cycles through: blank → available → unavailable → blank
  const toggleDateAvailability = useCallback((dateString: string) => {
    const isAvailable = availableDates.includes(dateString)
    const isUnavailable = unavailableDates.includes(dateString)
    
    if (!isAvailable && !isUnavailable) {
      // Currently blank → make available
      setAvailableDates(prevDates => {
        const newDates = [...prevDates, dateString]
        if (typeof window !== 'undefined') {
          localStorage.setItem('artist-available-dates', JSON.stringify(newDates))
        }
        return newDates
      })
    } else if (isAvailable && !isUnavailable) {
      // Currently available → make unavailable
      setAvailableDates(prevDates => {
        const newDates = prevDates.filter(date => date !== dateString)
        if (typeof window !== 'undefined') {
          localStorage.setItem('artist-available-dates', JSON.stringify(newDates))
        }
        return newDates
      })
      setUnavailableDates(prevDates => {
        const newDates = [...prevDates, dateString]
        if (typeof window !== 'undefined') {
          localStorage.setItem('artist-unavailable-dates', JSON.stringify(newDates))
        }
        return newDates
      })
    } else if (!isAvailable && isUnavailable) {
      // Currently unavailable → make blank
      setUnavailableDates(prevDates => {
        const newDates = prevDates.filter(date => date !== dateString)
        if (typeof window !== 'undefined') {
          localStorage.setItem('artist-unavailable-dates', JSON.stringify(newDates))
        }
        return newDates
      })
    }
  }, [availableDates, unavailableDates])

  // Optimized tab change handler with useTransition
  const handleTabChange = useCallback((value: string) => {
    startTransition(() => {
      setActiveTab(value)
    })
  }, [startTransition])

  // Optimized gig selection handler
  const handleGigSelect = useCallback((gigId: string) => {
    startTransition(() => {
      setSelectedGig(gigId)
    })
  }, [startTransition])

  // Optimized gig booking handler
  const handleGigBook = useCallback((gigId: string, gigData: Record<string, unknown>) => {
    sendGigUpdate(gigId, "status-changed", gigData)
  }, [sendGigUpdate])

  // Filter bookings based on selected filter - optimized memoization
  const filteredBookings = useMemo(() => {
    if (scheduleFilter === "all") return myBookings
    
    return myBookings.filter(booking => {
      switch (scheduleFilter) {
        case "confirmed":
          return booking.status === "confirmed"
        case "needs-band":
          return booking.status === "pending"
        case "past":
          return booking.isPast === true
        default:
          return true
      }
    })
  }, [myBookings, scheduleFilter])

  // Transform the data structure to match GigDetails interface - memoized
  const transformedGig = useMemo(() => {
    if (!selectedGig) return null
    const gig = mockGigs.find(g => g.id.toString() === selectedGig)
    if (!gig) return null
    
    return {
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
  }, [selectedGig, mockGigs])

  if (selectedGig && transformedGig) {
    return <GigDetails gigId={selectedGig} onBack={() => setSelectedGig(null)} gigData={transformedGig} />
  }

  // Artist stats cards - memoized for performance (moved here to be available before return)
  const artistStatsCards = useMemo(() => {
    // Calculate metrics from myBookings data
    const totalGigs = myBookings.length
    const upcomingGigs = myBookings.filter(booking => booking.status === "confirmed" && !booking.isPast).length
    const totalEarnings = myBookings.reduce((sum, booking) => sum + booking.earnings, 0)
    const bookingRate = totalGigs > 0 ? Math.round((upcomingGigs / totalGigs) * 100) : 0

    return [
      {
        title: "Total Gigs",
        value: totalGigs,
        color: "text-purple-600"
      },
      {
        title: "Upcoming Gigs",
        value: upcomingGigs,
        color: "text-green-600"
      },
      {
        title: "Total Earnings",
        value: `$${totalEarnings.toLocaleString()}`,
        color: "text-orange-600"
      },
      {
        title: "Booking Rate",
        value: `${bookingRate}%`,
        color: "text-blue-600"
      }
    ]
  }, [myBookings])

  return (
    <div className="min-h-screen bg-background">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mx-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </Button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <SimpleProfileUpload 
                value={profileImage || artistProfileImage}
                onChange={setProfileImage}
                size="lg"
                className=""
              />
            </div>
            <div>
              <span className="font-serif font-bold text-xl">
                {isClient && artistName ? `${artistName}'s Dashboard` : 'Artist Dashboard'}
              </span>
              {isPending && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Loading...</span>
                </div>
              )}
            </div>
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
            {/* Logout button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => authUtils.logout()}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
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

      {/* Artist Stats Cards */}
      {artistStatsCards && (
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {artistStatsCards.map((card, index) => (
              <Card key={index} className="p-4 text-center">
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-sm text-muted-foreground">{card.title}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-6 bg-card border-b border-border rounded-none h-12">
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
            value="profile"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile
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
                onSelectGig={handleGigSelect}
                onBookGig={handleGigBook}
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
              All Shows
            </Button>
            <Button 
              variant={scheduleFilter === "confirmed" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleFilter("confirmed")}
              className={`whitespace-nowrap ${scheduleFilter === "confirmed" ? "bg-green-600 hover:bg-green-700 text-white" : "border-green-200 text-green-700 hover:bg-green-50"}`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Confirmed Shows
            </Button>
            <Button 
              variant={scheduleFilter === "needs-band" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleFilter("needs-band")}
              className={`whitespace-nowrap ${scheduleFilter === "needs-band" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "border-yellow-200 text-yellow-700 hover:bg-yellow-50"}`}
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
              Needs Band
            </Button>
            <Button 
              variant={scheduleFilter === "past" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleFilter("past")}
              className={`whitespace-nowrap ${scheduleFilter === "past" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-blue-200 text-blue-700 hover:bg-blue-50"}`}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
              Past
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
                <h3 className="font-semibold text-lg text-foreground">My Shows</h3>
                <div className="text-sm text-muted-foreground">
                  {loading ? "Loading..." : `Showing ${filteredBookings.length} of ${myBookings.length} shows`}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Loading your shows...</div>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No shows found. When locations post gigs with your email, they&apos;ll appear here.</div>
                </div>
              ) : (
                <>
              {/* Color Key Legend for List View */}
              <Card className="p-4 bg-card border-border">
                    <h4 className="font-medium text-foreground mb-3">Show Status Legend</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                        <span className="text-muted-foreground">Confirmed Shows</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        </div>
                        <span className="text-muted-foreground">Needs Band</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                        <span className="text-muted-foreground">Past Shows</span>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className={`p-4 bg-card ${
                    booking.status === "confirmed" 
                      ? 'border-green-200 border-2' 
                           : booking.status === "pending"
                           ? 'border-yellow-200 border-2'
                           : booking.isPast
                           ? 'border-blue-200 border-2'
                           : 'border-gray-200 border-2'
                  }`}>
                    <div className="flex items-start gap-4">
                      <Image
                        src={booking.image || "/images/venu-logo.png"}
                            alt={booking.eventName || "Show"}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                                <h3 className="font-semibold text-foreground">{booking.eventName || getLocationDisplayName(booking.location)}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {new Date(booking.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })} • {booking.time}
                                  {booking.artistSetTime && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                      Set: {booking.artistSetTime}
                                    </span>
                                  )}
                            </div>
                                {booking.genre && (
                                  <div className="text-sm text-muted-foreground">
                                    Genre: {booking.genre}
                                  </div>
                                )}
                          </div>
                          <Badge 
                            variant={booking.status === "confirmed" ? "default" : "secondary"}
                                 className={
                                   booking.status === "confirmed" 
                                     ? "bg-green-600" 
                                     : booking.status === "pending"
                                     ? "bg-yellow-600"
                                     : booking.isPast
                                     ? "bg-blue-600"
                                     : "bg-gray-600"
                                 }
                               >
                                 {booking.status === "confirmed" 
                                   ? "Confirmed" 
                                   : booking.status === "pending"
                                   ? "Needs Band"
                                   : booking.isPast
                                   ? "Past Show"
                                   : booking.status
                                 }
                          </Badge>
                        </div>

                        {/* Status Indicator */}
                        <div className="flex items-center gap-2 mb-3">
                          {booking.status === "confirmed" ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                   Confirmed Show
                            </div>
                               ) : booking.status === "pending" ? (
                                 <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                   <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                   Needs Band
                                 </div>
                               ) : booking.isPast ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                   Past Show
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                   <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                   {booking.status}
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
                                <span className="text-muted-foreground">Your Earnings:</span>
                            <div className="font-medium text-green-400">${booking.earnings}</div>
                                {booking.artistPercentage && (
                                  <div className="text-xs text-muted-foreground">
                                    {booking.artistPercentage}% of revenue
                                  </div>
                                )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-28 bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => {
                              setSelectedBookingForModal(booking)
                              setShowEventDetailsModal(true)
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
                </>
              )}
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
                    ? `Showing ${availableDates.length} available dates`
                    : availabilityFilter === "all"
                    ? `Showing all dates (${availableDates.length} available, ${unavailableDates.length} unavailable)`
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
                    Click on blank dates to cycle through: blank → available → unavailable → blank
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
                    
                    // Check if date is available or unavailable
                    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isAvailable = availableDates.includes(dateString);
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
                    
                    // For available filter, only show explicitly available days
                    if (availabilityFilter === "available" && !isAvailable) {
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
                            // Single click - cycle through: blank → available → unavailable → blank
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
                            : isAvailable
                            ? availabilityFilter === "available"
                              ? 'bg-green-50 border-green-300 shadow-md'
                              : 'bg-white border-green-200'
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
                            : isAvailable
                            ? availabilityFilter === "available"
                              ? 'text-green-700 font-bold'
                              : 'text-green-600'
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
                        
                        {!bookingOnDate && !isPast && isAvailable && (
                          <div className={`text-xs mt-1 font-medium ${
                            isToday ? 'text-white' : 'text-green-600'
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
                    Click on blank dates to cycle through: blank → available → unavailable → blank
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
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-green-600 font-medium">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span className="text-red-600 font-medium">Unavailable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span className="text-gray-600 font-medium">Blank (Clickable)</span>
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

        {/* Profile Tab */}
        <TabsContent value="profile" className="p-4 space-y-6">
          <ProfileManagement
            userType="artist"
            initialData={{
              firstName: artistName?.split(' ')[0] || "",
              lastName: artistName?.split(' ').slice(1).join(' ') || "",
              email: artistProfileData.email,
              phone: artistProfileData.phone,
              location: "St. Augustine, FL",
              profileImage: artistProfileImage,
              bio: "A dynamic rock band known for high-energy performances and original compositions. Available for bookings with flexible scheduling and professional sound requirements."
            }}
            onSave={(data) => {
              console.log('Profile saved:', data)
              // In a real implementation, you would save this to the backend
            }}
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

      {/* Artist Event Details Modal */}
      <ArtistEventDetailsModal
        booking={selectedBookingForModal}
        isOpen={showEventDetailsModal}
        onClose={() => setShowEventDetailsModal(false)}
      />
    </div>
  )
}
