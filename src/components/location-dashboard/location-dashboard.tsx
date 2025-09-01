"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, FileText, MessageCircle, MoreHorizontal, Plus } from "lucide-react"
import Image from "next/image"
import { PostGigFlow } from "./post-gig-flow"
import { DiscoverTab } from "./discover-tab"
import { ScheduleTab } from "./schedule-tab"
import { ApplicationsTab } from "./applications-tab"
import { ChatTab } from "./chat-tab"
import { MoreTab } from "./more-tab"
import { RealTimeNotifications } from "@/components/real-time-notifications"
import { RealTimeGigUpdates } from "@/components/real-time-gig-updates"
import { WindowManagerProvider } from "@/contexts/WindowManagerContext"

interface LocationDashboardProps {
  locationId?: string;
  currentUserId?: string;
}

export function LocationDashboard({ locationId = "default-location", currentUserId }: LocationDashboardProps) {
  const [activeTab, setActiveTab] = useState("discover")
  const [showPostGig, setShowPostGig] = useState(false)
  
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
        localStorage.setItem('venue-unavailable-dates', JSON.stringify(newDates))
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
            <Image src="/images/venu-logo.png" alt="venu" width={40} height={40} />
            <h1 className="font-serif font-bold text-xl">Location Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <WindowManagerProvider>
              <RealTimeNotifications />
              <RealTimeGigUpdates locationId={locationId} />
            </WindowManagerProvider>
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setShowPostGig(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post a Gig
            </Button>
          </div>
        </div>
      </div>

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
              unavailableDates={unavailableDates}
              onToggleDateAvailability={toggleDateAvailability}
            />
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <ApplicationsTab />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <ChatTab locationId={locationId} currentUserId={currentUserId || "location-user"} />
          </TabsContent>

          {/* More Tab */}
          <TabsContent value="more" className="space-y-4">
            <MoreTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
