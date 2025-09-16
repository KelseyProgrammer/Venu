"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, FileText, MessageCircle, MoreHorizontal, Plus, MapPin, Users, Star, LogOut, User } from "lucide-react"
import Image from "next/image"
import { PostGigFlow } from "./post-gig-flow"
import { LocationCreationForm } from "./location-creation-form"
import { DiscoverTab } from "./discover-tab"
import { ScheduleTab } from "./schedule-tab"
import { ApplicationsTab } from "./applications-tab"
import { ChatTab } from "./chat-tab"
import { MoreTab } from "./more-tab"
import { RealTimeNotifications } from "@/components/real-time-notifications"
import { RealTimeGigUpdates } from "@/components/real-time-gig-updates"
import { WindowManagerProvider } from "@/contexts/WindowManagerContext"
import { useCurrentUserLocation } from "@/hooks/useLocation"
import { Card } from "@/components/ui/card"
import { authUtils } from "@/lib/utils"
import { useNotifications } from "@/hooks/useNotifications"


interface LocationDashboardProps {
  locationId?: string;
  currentUserId?: string;
}

interface LocationDisplayInfo {
  name: string;
  city: string;
  state: string;
  capacity: number;
  rating: number;
}

interface AnalyticsCard {
  title: string;
  value: string | number;
  color: string;
}

export function LocationDashboard({ currentUserId }: LocationDashboardProps) {
  const [activeTab, setActiveTab] = useState("discover")
  const [showPostGig, setShowPostGig] = useState(false)
  const [showLocationCreation, setShowLocationCreation] = useState(false)
  
  // State to track if we're on the client side
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Use the custom hook to fetch current user's location data
  const { 
    location, 
    gigs, 
    authorizedPromoters, 
    analytics, 
    loading, 
    error, 
    refreshData 
  } = useCurrentUserLocation()

  // Get current user ID for notifications
  const actualCurrentUserId = isClient ? authUtils.getCurrentUser()?.id : undefined;

  // Use notifications hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isConnected: notificationsConnected,
    error: notificationsError,
    isLoading: notificationsLoading
  } = useNotifications(actualCurrentUserId)
  
  // Available dates state (dates explicitly marked as available)
  const [availableDates, setAvailableDates] = useState<string[]>(() => {
    // Load from localStorage or use default values
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('venue-available-dates')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          // Failed to parse saved available dates, using defaults
        }
      }
    }
    // Default available dates for current month
    return [
      "2024-12-10",
      "2024-12-17", 
      "2024-12-24"
    ]
  })

  // Unavailable dates state (dates when venue is closed or unavailable)
  const [unavailableDates, setUnavailableDates] = useState<string[]>(() => {
    // Load from localStorage or use default values
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('venue-unavailable-dates')
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
      "2024-12-05",
      "2024-12-12", 
      "2024-12-19"
    ]
  })

  const handleTabChange = useCallback((value: string) => setActiveTab(value), [])

  // Toggle date availability with cycling logic: blank → available → unavailable → blank
  const toggleDateAvailability = useCallback((dateString: string) => {
    const isCurrentlyAvailable = availableDates.includes(dateString)
    const isCurrentlyUnavailable = unavailableDates.includes(dateString)
    
    if (!isCurrentlyAvailable && !isCurrentlyUnavailable) {
      // Currently blank → mark as available
      setAvailableDates(prevDates => {
        const newDates = [...prevDates, dateString]
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('venue-available-dates', JSON.stringify(newDates))
          } catch (error) {
            console.warn('Failed to save available dates to localStorage:', error)
          }
        }
        return newDates
      })
    } else if (isCurrentlyAvailable && !isCurrentlyUnavailable) {
      // Currently available → mark as unavailable
      setAvailableDates(prevDates => {
        const newDates = prevDates.filter(date => date !== dateString)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('venue-available-dates', JSON.stringify(newDates))
          } catch (error) {
            console.warn('Failed to save available dates to localStorage:', error)
          }
        }
        return newDates
      })
      setUnavailableDates(prevDates => {
        const newDates = [...prevDates, dateString]
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('venue-unavailable-dates', JSON.stringify(newDates))
          } catch (error) {
            console.warn('Failed to save unavailable dates to localStorage:', error)
          }
        }
        return newDates
      })
    } else if (!isCurrentlyAvailable && isCurrentlyUnavailable) {
      // Currently unavailable → mark as blank (remove from both)
      setUnavailableDates(prevDates => {
        const newDates = prevDates.filter(date => date !== dateString)
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('venue-unavailable-dates', JSON.stringify(newDates))
          } catch (error) {
            console.warn('Failed to save unavailable dates to localStorage:', error)
          }
        }
        return newDates
      })
    }
  }, [availableDates, unavailableDates])

  // Memoized location display info to prevent unnecessary re-renders
  const locationDisplayInfo = useMemo(() => {
    if (!location) return null
    
    return {
      name: location.name,
      city: location.city,
      state: location.state,
      capacity: location.capacity,
      rating: location.rating,
    } as LocationDisplayInfo
  }, [location])

  // Memoized analytics cards to prevent unnecessary re-renders
  const analyticsCards = useMemo(() => {
    if (!analytics) return null

    return [
      {
        title: "Total Gigs",
        value: analytics.totalGigs,
        color: "text-purple-600"
      },
      {
        title: "Upcoming",
        value: analytics.upcomingGigs,
        color: "text-green-600"
      },
      {
        title: "Avg Fill Rate",
        value: `${analytics.averageFillRate}%`,
        color: "text-blue-600"
      },
      {
        title: "Monthly Revenue",
        value: `$${analytics.monthlyRevenue.toLocaleString()}`,
        color: "text-orange-600"
      }
    ] as AnalyticsCard[]
  }, [analytics])

  // Check authentication before allowing gig creation
  const handlePostGigClick = useCallback(() => {
    if (!authUtils.isAuthenticated()) {
      alert('Please log in to create a gig. You will be redirected to the login page.');
      window.location.href = '/';
      return;
    }
    setShowPostGig(true);
  }, []);

  if (showPostGig) {
    return (
      <PostGigFlow 
        onClose={() => setShowPostGig(false)} 
        locationId={location?._id || ""} 
      />
    )
  }

  if (showLocationCreation) {
    return (
      <LocationCreationForm 
        onClose={() => setShowLocationCreation(false)} 
        onSuccess={() => {
          setShowLocationCreation(false)
          refreshData()
        }} 
      />
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading location data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    const isAuthError = error.includes('log in') || error.includes('Authentication failed');
    const isNoLocationError = error.includes('No location found') || error.includes('create a location');
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Image src="/images/venu-logo.png" alt="venu" width={80} height={80} className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Location Dashboard</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          {isAuthError ? (
            <div className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/'} 
                className="bg-purple-600 hover:bg-purple-700 text-white w-full"
              >
                Go to Login
              </Button>
                              <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account? <Link href="/" className="text-purple-600 hover:underline">Sign up here</Link>
                </p>
            </div>
          ) : isNoLocationError ? (
            <div className="space-y-4">
              <Button 
                onClick={() => setShowLocationCreation(true)} 
                className="bg-purple-600 hover:bg-purple-700 text-white w-full"
              >
                Create Location Profile
              </Button>
              <p className="text-sm text-muted-foreground">
                Set up your venue to start booking gigs
              </p>
            </div>
          ) : (
            <Button onClick={refreshData} className="bg-purple-600 hover:bg-purple-700 text-white">
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl">
                {isClient && locationDisplayInfo?.name ? `${locationDisplayInfo.name}'s Dashboard` : 'Location Dashboard'}
              </h1>
              {locationDisplayInfo && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {locationDisplayInfo.city}, {locationDisplayInfo.state}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {locationDisplayInfo.capacity} capacity
                  </div>
                  {locationDisplayInfo.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {locationDisplayInfo.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WindowManagerProvider>
              <RealTimeNotifications 
                notifications={notifications}
                unreadCount={unreadCount}
                isConnected={notificationsConnected}
                error={notificationsError}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
              <RealTimeGigUpdates locationId={location?._id || ""} />
            </WindowManagerProvider>
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
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handlePostGigClick}>
              <Plus className="w-4 h-4 mr-2" />
              Post a Gig
            </Button>
          </div>
        </div>
      </div>

      {/* Location Stats Cards */}
      {analyticsCards && (
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {analyticsCards.map((card, index) => (
              <Card key={index} className="p-4 text-center">
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-sm text-muted-foreground">{card.title}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          {/* Main Tabs */}
          <TabsList className="grid w-full grid-cols-5 bg-muted">
            <TabsTrigger value="discover" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2">
              <Search className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="more" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2">
              <MoreHorizontal className="h-4 w-4" />
              More
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-4">
            <DiscoverTab />
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <ScheduleTab 
              locationId={location?._id || ""}
              location={location}
              gigs={gigs}
              availableDates={availableDates}
              unavailableDates={unavailableDates}
              onToggleDateAvailability={toggleDateAvailability}
              onRefreshGigs={refreshData}
            />
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <ApplicationsTab />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <ChatTab locationId={location?._id || ""} currentUserId={actualCurrentUserId || "location-user"} />
          </TabsContent>

          {/* More Tab */}
          <TabsContent value="more" className="space-y-4">
            <MoreTab location={location} analytics={analytics} authorizedPromoters={authorizedPromoters} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Debug panel for development */}
      

    </div>
  )
}
