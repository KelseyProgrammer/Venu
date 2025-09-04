"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Calendar, FileText, MessageCircle, MoreHorizontal, LogOut } from "lucide-react"
import { OverviewTab } from "./overview-tab"
import { DiscoverTab } from "./discover-tab"
import { ScheduleTab } from "./schedule-tab"
import { ApplicationsTab } from "./applications-tab"
import { ChatTab } from "./chat-tab"
import { MoreTab } from "./more-tab"
import { ErrorBoundary } from "./error-boundary"
import { PostGigFlow } from "./post-gig-flow"

import { RealTimeNotifications } from "@/components/real-time-notifications"
import { RealTimeGigUpdates } from "@/components/real-time-gig-updates"
import { WindowManagerProvider } from "@/contexts/WindowManagerContext"
import { authUtils } from "@/lib/utils"
import { SimpleProfileUpload } from "@/components/ui/simple-profile-upload"

export function PromoterDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showPostGig, setShowPostGig] = useState(false)
  const [profileImage, setProfileImage] = useState<string>("")
  
  // Unavailable dates state (dates when venues are closed or unavailable)
  const [unavailableDates, setUnavailableDates] = useState<string[]>(() => {
    // Load from localStorage or use default values
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('promoter-unavailable-dates')
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

  const myLocations = [
    { id: "muggys", name: "Muggsy's" },
    { id: "sarbez", name: "Sarbez" },
    { id: "alfreds", name: "Alfred's" }
  ]

  // Promoter profile data - memoized for performance
  const promoterProfileData = useMemo(() => {
    // Only get user data on the client side to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return {
        name: "Promoter",
        profileImage: "/images/venu-logo.png",
        email: "promoter@venu.com",
        phone: "+1 (555) 987-6543",
        company: "VENU Promotions"
      }
    }
    
    const currentUser = authUtils.getCurrentUser();
    
    return {
      name: currentUser ? authUtils.getUserFullName() : "Promoter",
      profileImage: currentUser?.profileImage || "/images/venu-logo.png",
      email: currentUser?.email || "promoter@venu.com",
      phone: "+1 (555) 987-6543",
      company: "VENU Promotions"
    }
  }, [])

  const { name: promoterName, profileImage: promoterProfileImage } = promoterProfileData

  // State to track if we're on the client side
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleTabChange = useCallback((value: string) => setActiveTab(value), [])

  // Toggle date availability
  const toggleDateAvailability = useCallback((dateString: string) => {
    setUnavailableDates(prevDates => {
      const newDates = prevDates.includes(dateString)
        ? prevDates.filter(date => date !== dateString)
        : [...prevDates, dateString]
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('promoter-unavailable-dates', JSON.stringify(newDates))
      }
      
      return newDates
    })
  }, [])

  if (showPostGig) {
    return <PostGigFlow onClose={() => setShowPostGig(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
            {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <SimpleProfileUpload 
                value={profileImage || promoterProfileImage}
                onChange={setProfileImage}
                size="lg"
                className=""
              />
            </div>
            <div>
              <span className="font-serif font-bold text-xl">
                {isClient && promoterName ? `${promoterName}'s Dashboard` : 'Promoter Dashboard'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Search className="w-5 h-5" />
            </Button>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {myLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <WindowManagerProvider>
              <RealTimeNotifications />
              <RealTimeGigUpdates locationId={selectedLocation} />
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
            <Button 
              onClick={() => setShowPostGig(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Gig
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-muted/50">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="discover" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger 
              value="applications" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="more" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <MoreHorizontal className="w-4 h-4 mr-2" />
              More
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <ErrorBoundary>
              <OverviewTab 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedLocation={selectedLocation}
              />
            </ErrorBoundary>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="mt-6">
            <ErrorBoundary>
              <DiscoverTab />
            </ErrorBoundary>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="mt-6">
            <ErrorBoundary>
              <ScheduleTab 
                unavailableDates={unavailableDates}
                onToggleDateAvailability={toggleDateAvailability}
              />
            </ErrorBoundary>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-6">
            <ErrorBoundary>
              <ApplicationsTab />
            </ErrorBoundary>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-6">
            <ErrorBoundary>
              <ChatTab selectedLocation={selectedLocation} />
            </ErrorBoundary>
          </TabsContent>

          {/* More Tab */}
          <TabsContent value="more" className="mt-6">
            <ErrorBoundary>
              <MoreTab />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
