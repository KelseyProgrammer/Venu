"use client"

import React, { useState, useMemo, useCallback, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Calendar,
  FileText,
  MessageCircle,
  MoreHorizontal,
  User,
  LogOut,
} from "lucide-react"
import { authUtils } from "@/lib/utils"
import { RealTimeNotifications } from "./real-time-notifications"
import { BandConfirmationModal } from "./band-confirmation-modal"
import { RealTimeGigUpdates } from "./real-time-gig-updates"
import { RealTimeChat } from "./real-time-chat"
import { useSocket } from "@/lib/socket"
import { useArtistRealTime } from "@/hooks/useArtistRealTime"
import { ProfileManagement } from "@/components/ui/profile-management"
import { GigProfile, gigApi, authApi } from "@/lib/api"
import { PerformanceErrorBoundary } from "@/components/ui/error-boundary"

// Sub-components
import { ArtistEventDetailsModal } from "./artist-dashboard/ArtistEventDetailsModal"
import { DiscoverTab } from "./artist-dashboard/DiscoverTab"
import { ScheduleTab } from "./artist-dashboard/ScheduleTab"
import { ApplicationsTab } from "./artist-dashboard/ApplicationsTab"
import { MoreTab } from "./artist-dashboard/MoreTab"
import type { Gig, Booking } from "./artist-dashboard/types"

// Dynamic import for gig details (heavy component)
import dynamic from "next/dynamic"

interface GigDetailsProps {
  gigId: string
  onBack: () => void
  gigData: GigProfile
}

const GigDetailsLazy = dynamic(
  () => import("./gig-details").then((mod) => ({ default: mod.GigDetails as unknown as React.ComponentType<GigDetailsProps> })),
  { loading: () => <div className="flex items-center justify-center p-8">Loading gig details...</div> }
)

export function ArtistDashboard() {
  const [activeTab, setActiveTab] = useState("discover")
  const [selectedGig, setSelectedGig] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false)
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<Booking | null>(null)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [selectedGigForConfirmation, setSelectedGigForConfirmation] = useState<GigProfile | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Socket and real-time
  const { autoConnect } = useSocket()
  const {
    notifications,
    gigUpdates,
    isConnected: realTimeConnected,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useArtistRealTime({ artistId: isClient ? authUtils.getCurrentUser()?.id || "" : "" })

  // Gig data (artist's own gigs)
  const [gigs, setGigs] = useState<GigProfile[]>([])
  const [gigsLoading, setGigsLoading] = useState(true)

  // Open gigs (discover feed)
  const [openGigs, setOpenGigs] = useState<GigProfile[]>([])
  const [openGigsLoading, setOpenGigsLoading] = useState(true)
  const [openGigsError, setOpenGigsError] = useState<string | null>(null)

  // Availability (shared between ScheduleTab and MoreTab)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    setIsClient(true)
    if (!authUtils.isAuthenticated()) {
      window.location.href = '/?redirect=/artist'
    }
  }, [])

  useEffect(() => {
    let mounted = true
    autoConnect().catch((err) => {
      if (mounted) {
        console.error("Failed to auto-connect socket:", err)
        setError("Failed to connect to real-time services")
      }
    })
    return () => { mounted = false }
  }, [autoConnect])

  useEffect(() => {
    if (!isClient) return
    const user = authUtils.getCurrentUser()
    if (!user?.email) {
      const token = authUtils.getAuthToken()
      if (!token || token.length < 10 || !token.includes(".")) {
        window.location.href = "/"
      }
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    try {
      const saved = localStorage.getItem("artist-available-dates")
      const savedUnavail = localStorage.getItem("artist-unavailable-dates")
      if (saved) setAvailableDates(JSON.parse(saved))
      if (savedUnavail) setUnavailableDates(JSON.parse(savedUnavail))
    } catch (e) {
      console.error("Error loading availability from localStorage:", e)
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    const fetchGigs = async () => {
      try {
        setGigsLoading(true)
        const user = authUtils.getCurrentUser()
        if (!user?.email) { setGigsLoading(false); return }
        const res = await gigApi.getGigsByArtist(user.email)
        if (res.success && res.data) setGigs(res.data)
      } catch {
        // silently fail — schedule tab will show empty
      } finally {
        setGigsLoading(false)
      }
    }
    fetchGigs()
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    const fetchOpenGigs = async () => {
      try {
        setOpenGigsLoading(true)
        const user = authUtils.getCurrentUser()
        const res = await gigApi.getAllGigs({ status: 'posted', limit: 50 })
        if (res.success && res.data) {
          // Filter out gigs the artist is already part of
          const myEmail = user?.email?.toLowerCase()
          const filtered = res.data.filter(g =>
            !myEmail || !g.bands.some(b => b.email.toLowerCase() === myEmail)
          )
          setOpenGigs(filtered)
        } else {
          setOpenGigsError(res.error || "Failed to load open gigs")
        }
      } catch {
        setOpenGigsError("Failed to load open gigs")
      } finally {
        setOpenGigsLoading(false)
      }
    }
    fetchOpenGigs()
  }, [isClient])

  useEffect(() => {
    if (gigUpdates.length === 0) return
    const refreshGigs = async () => {
      const user = authUtils.getCurrentUser()
      if (!user?.email) return
      try {
        const res = await gigApi.getGigsByArtist(user.email)
        if (res.success && res.data) setGigs(res.data)
      } catch (e) {
        console.error("Error refreshing gigs after real-time update:", e)
      }
    }
    refreshGigs()
  }, [gigUpdates])

  useEffect(() => {
    const handleOpen = (evt: Event) => {
      const e = evt as CustomEvent
      setSelectedGigForConfirmation(e.detail.gig)
      setShowConfirmationModal(true)
    }
    const handleDone = async () => {
      const user = authUtils.getCurrentUser()
      if (!user?.email) return
      try {
        const res = await gigApi.getGigsByArtist(user.email)
        if (res.success && res.data) setGigs(res.data)
      } catch (err) {
        console.error("Error refreshing after confirmation:", err)
      }
    }
    window.addEventListener("open-gig-confirmation", handleOpen)
    window.addEventListener("gig-confirmation-completed", handleDone)
    return () => {
      window.removeEventListener("open-gig-confirmation", handleOpen)
      window.removeEventListener("gig-confirmation-completed", handleDone)
    }
  }, [])

  // ── Derived data ─────────────────────────────────────────────────────────

  const artistProfileData = useMemo(() => {
    if (!isClient) {
      return { name: "Artist", email: "artist@example.com", phone: "+1 (555) 123-4567" }
    }
    const user = authUtils.getCurrentUser()
    return {
      name: user ? authUtils.getUserFullName() : "Artist",
      email: user?.email || "artist@example.com",
      phone: "+1 (555) 123-4567",
    }
  }, [isClient])

  const earningsData = useMemo(() => {
    const userEmail = isClient ? authUtils.getCurrentUser()?.email?.toLowerCase() : undefined
    const goalAmount = 1000

    const completedGigs = gigs.filter(g => g.status === "completed")
    const totalEarnings = completedGigs.reduce((sum, gig) => {
      const myBand = userEmail ? gig.bands?.find(b => b.email.toLowerCase() === userEmail) : null
      if (!myBand?.confirmed) return sum
      return sum + gig.guarantee + gig.ticketsSold * gig.ticketPrice * (myBand.percentage / 100)
    }, 0)

    const upcomingPayouts = gigs
      .filter(g => {
        if (g.status !== "posted" && g.status !== "live") return false
        const myBand = userEmail ? g.bands?.find(b => b.email.toLowerCase() === userEmail) : null
        return myBand?.confirmed
      })
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 5)
      .map(gig => ({
        date: new Date(gig.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        eventName: gig.eventName,
        amount: gig.guarantee,
        status: gig.status as string,
      }))

    return { totalEarnings, goalAmount, progressPercentage: goalAmount > 0 ? (totalEarnings / goalAmount) * 100 : 0, upcomingPayouts }
  }, [gigs, isClient])

  const transformedGigs = useMemo((): Gig[] =>
    gigs.map((gig, index) => ({
      id: index + 1,
      location: gig.selectedLocation?.name || "Unknown Venue",
      address: gig.selectedLocation?.address || "Address TBA",
      date: new Date(gig.eventDate).toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric",
      }),
      time: gig.eventTime,
      genre: gig.eventGenre,
      guarantee: gig.guarantee,
      ticketPrice: gig.ticketPrice,
      tier1: { amount: gig.bonusTiers?.tier1?.amount || 0, threshold: gig.bonusTiers?.tier1?.threshold || 25, color: gig.bonusTiers?.tier1?.color || "bg-yellow-500" },
      tier2: { amount: gig.bonusTiers?.tier2?.amount || 0, threshold: gig.bonusTiers?.tier2?.threshold || 50, color: gig.bonusTiers?.tier2?.color || "bg-green-500" },
      tier3: { amount: gig.bonusTiers?.tier3?.amount || 0, threshold: gig.bonusTiers?.tier3?.threshold || 75, color: gig.bonusTiers?.tier3?.color || "bg-blue-500" },
      ticketsSold: gig.ticketsSold,
      totalTickets: gig.ticketCapacity,
      rating: gig.rating || 0,
      requirements: gig.requirements?.map((r) => r.text) || [],
      image: gig.image || "/images/venu-logo.png",
      bands: gig.bands?.map((band, bi) => ({
        id: bi.toString(), name: band.name, genre: band.genre,
        setTime: band.setTime, percentage: band.percentage, email: band.email, guarantee: 0,
      })) || [],
    })),
    [gigs]
  )

  const myBookings = useMemo((): Booking[] => {
    const user = authUtils.getCurrentUser()
    if (!user?.email) return []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return gigs.map((gig, index) => {
      const artistBand = gig.bands?.find(
        (b) => b.email.toLowerCase() === user.email.toLowerCase()
      )
      const eventDate = new Date(gig.eventDate)
      eventDate.setHours(0, 0, 0, 0)
      let status: Booking["status"] = "pending"
      if (eventDate < today) {
        status = "completed"
      } else if ((gig as GigProfile & { status?: string }).status === "pending-confirmation") {
        status = "awaiting-confirmation"
      } else if (gig.bands.filter((b) => b.confirmed).length >= gig.numberOfBands) {
        status = "confirmed"
      }
      return {
        id: index + 1,
        location: gig.selectedLocation?.name || "Unknown Venue",
        date: gig.eventDate,
        time: gig.eventTime,
        status,
        ticketsSold: gig.ticketsSold,
        totalTickets: gig.ticketCapacity,
        earnings: gig.ticketsSold * gig.ticketPrice * (artistBand?.percentage || 0) / 100,
        image: gig.image || "/images/venu-logo.png",
        gigId: gig._id,
        eventName: gig.eventName,
        genre: gig.eventGenre,
        artistSetTime: artistBand?.setTime || "",
        artistPercentage: artistBand?.percentage || 0,
        artistGuarantee: 0,
        isPast: eventDate < today,
        confirmedBands: gig.bands.filter((b) => b.confirmed).length,
        expectedBands: gig.numberOfBands,
      }
    })
  }, [gigs])

  const notificationCounts = useMemo(() => {
    const n = notifications || []
    return {
      bookingRequests: n.filter((x) => (x.type === "booking-request" || x.type === "gig-confirmation-required") && !x.read).length,
      gigConfirmations: n.filter((x) => x.type === "gig-confirmation-required" && !x.read).length,
      messages: n.filter((x) => x.type === "message" && !x.read).length,
      newGigs: gigUpdates.filter((u) => u.updateType === "created").length,
      totalUpdates: gigUpdates.length,
    }
  }, [notifications, gigUpdates])

  const artistStatsCards = useMemo(() => {
    const total = myBookings.length
    const upcoming = myBookings.filter((b) => b.status === "confirmed" && !b.isPast).length
    const earnings = myBookings.reduce((s, b) => s + b.earnings, 0)
    const rate = total > 0 ? Math.round((upcoming / total) * 100) : 0
    return [
      { title: "Total Gigs", value: total, color: "text-purple-600" },
      { title: "Upcoming Gigs", value: upcoming, color: "text-green-600" },
      { title: "Total Earnings", value: `$${earnings.toLocaleString()}`, color: "text-orange-600" },
      { title: "Booking Rate", value: `${rate}%`, color: "text-blue-600" },
    ]
  }, [myBookings])

  const transformedGig = useMemo((): GigProfile | null => {
    if (!selectedGig) return null
    const gig = transformedGigs.find((g) => g.id.toString() === selectedGig)
    if (!gig) return null
    return {
      _id: gig.id.toString(),
      eventName: `${gig.location} - ${gig.genre} Night`,
      eventDate: gig.date,
      eventTime: gig.time,
      eventGenre: gig.genre,
      ticketCapacity: gig.totalTickets,
      ticketPrice: gig.ticketPrice,
      doorPersonEmail: "door@example.com",
      bands: [],
      guarantee: gig.guarantee,
      numberOfBands: 1,
      ticketsSold: gig.ticketsSold,
      selectedLocation: {
        _id: gig.location, name: gig.location, address: gig.address,
        city: "St. Augustine", state: "FL", zipCode: "32084", country: "USA",
        capacity: gig.totalTickets, amenities: [], contactPerson: "Venue Manager",
        contactEmail: "info@example.com", contactPhone: "+1 (555) 123-4567",
        images: [], rating: 4.5, tags: [], isActive: true, createdBy: "system",
        authorizedPromoters: [], createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      requirements: gig.requirements.map((r) => ({ text: r, checked: true })),
      bonusTiers: {
        tier1: gig.tier1, tier2: gig.tier2, tier3: gig.tier3,
      },
      status: "live" as const,
      rating: gig.rating,
      tags: [gig.genre],
      image: gig.image,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, [selectedGig, transformedGigs])

  // ── Handlers ─────────────────────────────────────────────────────────────

  const debouncedSave = useCallback((key: string, data: string[]) => {
    const id = setTimeout(() => {
      try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
    }, 300)
    return () => clearTimeout(id)
  }, [])

  const toggleDateAvailability = useCallback(
    (dateString: string) => {
      const isAvailable = availableDates.includes(dateString)
      const isUnavailable = unavailableDates.includes(dateString)
      startTransition(() => {
        if (!isAvailable && !isUnavailable) {
          setAvailableDates((prev) => {
            const next = [...prev, dateString]
            debouncedSave("artist-available-dates", next)
            return next
          })
        } else if (isAvailable) {
          setAvailableDates((prev) => {
            const next = prev.filter((d) => d !== dateString)
            debouncedSave("artist-available-dates", next)
            return next
          })
          setUnavailableDates((prev) => {
            const next = [...prev, dateString]
            debouncedSave("artist-unavailable-dates", next)
            return next
          })
        } else {
          setUnavailableDates((prev) => {
            const next = prev.filter((d) => d !== dateString)
            debouncedSave("artist-unavailable-dates", next)
            return next
          })
        }
      })
    },
    [availableDates, unavailableDates, debouncedSave]
  )

  const clearAllAvailabilityData = useCallback(() => {
    setAvailableDates([])
    setUnavailableDates([])
    localStorage.removeItem("artist-available-dates")
    localStorage.removeItem("artist-unavailable-dates")
  }, [])

  const handleTabChange = useCallback(
    (value: string) => startTransition(() => setActiveTab(value)),
    []
  )

  const handleApplyToOpenGig = useCallback(
    async (gigId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await gigApi.applyToGig(gigId)
        if (res.success) {
          // Remove from open gigs feed so it doesn't show again
          setOpenGigs(prev => prev.filter(g => g._id !== gigId))
        }
        return res.error ? { success: res.success, error: res.error } : { success: res.success }
      } catch {
        return { success: false, error: "Failed to submit application" }
      }
    },
    []
  )

  const handleViewDetails = useCallback((booking: Booking) => {
    setSelectedBookingForModal(booking)
    setShowEventDetailsModal(true)
  }, [])

  const handleConfirmationComplete = useCallback(async () => {
    setShowConfirmationModal(false)
    setSelectedGigForConfirmation(null)
    const user = authUtils.getCurrentUser()
    if (user?.email) {
      try {
        const res = await gigApi.getGigsByArtist(user.email)
        if (res.success && res.data) setGigs(res.data)
      } catch {}
    }
    window.dispatchEvent(
      new CustomEvent("gig-confirmation-completed", {
        detail: { gigId: selectedGigForConfirmation?._id },
      })
    )
  }, [selectedGigForConfirmation])

  // ── Render ────────────────────────────────────────────────────────────────

  if (selectedGig && transformedGig) {
    return (
      <GigDetailsLazy
        gigId={selectedGig}
        onBack={() => setSelectedGig(null)}
        gigData={transformedGig}
      />
    )
  }

  return (
    <PerformanceErrorBoundary componentName="ArtistDashboard">
      <div className="min-h-screen bg-background">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mx-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <div>
              <span className="font-serif font-bold text-xl">
                {isClient && artistProfileData.name
                  ? `${artistProfileData.name}'s Dashboard`
                  : "Artist Dashboard"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RealTimeGigUpdates locationId="artist-dashboard" />
              <RealTimeNotifications
                notifications={notifications}
                unreadCount={(notifications || []).filter((n) => !n.read).length}
                isConnected={realTimeConnected}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAllNotifications}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => authUtils.logout()}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
              <div className="flex items-center gap-1 text-xs">
                <div className={`w-2 h-2 rounded-full ${realTimeConnected ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-muted-foreground">{realTimeConnected ? "Live" : "Offline"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {artistStatsCards.map((card, i) => (
              <Card key={i} className="p-4 text-center">
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-sm text-muted-foreground">{card.title}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full grid grid-cols-6 bg-card border-b border-border rounded-none h-12">
            {[
              { value: "discover", icon: <Search className="h-4 w-4" />, label: "Discover" },
              { value: "schedule", icon: <Calendar className="h-4 w-4" />, label: "Schedule" },
              { value: "applications", icon: <FileText className="h-4 w-4" />, label: "Applications" },
              { value: "chat", icon: <MessageCircle className="h-4 w-4" />, label: "Chat" },
              { value: "profile", icon: <User className="h-4 w-4" />, label: "Profile" },
              { value: "more", icon: <MoreHorizontal className="h-4 w-4" />, label: "More" },
            ].map(({ value, icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground flex items-center gap-2"
              >
                {icon}
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="discover">
            <DiscoverTab
              openGigs={openGigs}
              openGigsLoading={openGigsLoading}
              openGigsError={openGigsError}
              onApply={handleApplyToOpenGig}
            />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleTab
              myBookings={myBookings}
              availableDates={availableDates}
              unavailableDates={unavailableDates}
              onToggleAvailability={toggleDateAvailability}
              gigsLoading={gigsLoading}
              bookingRequests={notificationCounts.bookingRequests}
              gigConfirmations={notificationCounts.gigConfirmations}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationsTab totalUpdates={notificationCounts.totalUpdates} gigs={gigs} />
          </TabsContent>

          <TabsContent value="chat" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl">Venue Chat</h2>
            </div>
            <RealTimeChat locationId="artist-dashboard" currentUserId={isClient ? authUtils.getCurrentUser()?.id || "" : ""} className="h-96" />
          </TabsContent>

          <TabsContent value="profile" className="p-4 space-y-6">
            <ProfileManagement
              userType="artist"
              initialData={{
                firstName: artistProfileData.name?.split(" ")[0] || "",
                lastName: artistProfileData.name?.split(" ").slice(1).join(" ") || "",
                email: artistProfileData.email,
                phone: artistProfileData.phone,
                location: "St. Augustine, FL",
                bio: "A dynamic rock band known for high-energy performances and original compositions.",
              }}
              onSave={async (data) => {
                await authApi.updateProfile({
                  firstName: data.firstName,
                  lastName: data.lastName,
                  phone: data.phone,
                })
              }}
            />
          </TabsContent>

          <TabsContent value="more">
            <MoreTab
              earningsData={earningsData}
              availableDates={availableDates}
              unavailableDates={unavailableDates}
              onClearAvailability={clearAllAvailabilityData}
            />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ArtistEventDetailsModal
          booking={selectedBookingForModal}
          isOpen={showEventDetailsModal}
          onClose={() => setShowEventDetailsModal(false)}
        />
        <BandConfirmationModal
          gig={selectedGigForConfirmation}
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmationComplete}
        />
      </div>
    </PerformanceErrorBoundary>
  )
}
