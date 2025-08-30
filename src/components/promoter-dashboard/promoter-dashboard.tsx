"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Calendar, FileText, MessageCircle, MoreHorizontal } from "lucide-react"
import { OverviewTab } from "./overview-tab"
import { DiscoverTab } from "./discover-tab"
import { ScheduleTab } from "./schedule-tab"
import { ApplicationsTab } from "./applications-tab"
import { ChatTab } from "./chat-tab"
import { MoreTab } from "./more-tab"
import { ErrorBoundary } from "./error-boundary"
import { getMyLocations } from "./data"

export function PromoterDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showPostGig, setShowPostGig] = useState(false)
  
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

  const myLocations = getMyLocations()

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="font-serif font-bold text-2xl text-foreground">Promoter Dashboard</h1>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
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
              </div>
            </div>
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
