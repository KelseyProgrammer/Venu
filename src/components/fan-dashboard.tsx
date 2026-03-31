"use client"

import { useState, useMemo, useCallback, memo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, MapPin, Star, Share2, Clock, Heart, Ticket, Download, Compass, LogOut, User } from "lucide-react"
import Image from "next/image"
import { TicketPurchase } from "./ticket-purchase"
import { getLocationDisplayName } from "@/lib/location-data"
import { GenreFilters } from "./genre-filters"
import { ArtistListing } from "./artist-listing"
import { RealTimeFanNotifications } from "./real-time-fan-notifications"
import { RealTimeEventsGrid } from "./real-time-events-grid"
import { VerticalEventsGrid } from "./vertical-events-grid"
import { useFanRealTime } from "@/hooks/useFanRealTime"
import { useGigs } from "@/hooks/useGigs"
import { authUtils } from "@/lib/utils"
import { artistApi, locationApi, ticketApi, ArtistProfile, LocationProfile } from "@/lib/api"

// Remove unused interface and component
// interface ArtistCardProps {
//   artist: {
//     id: string
//     artist: string
//     genre: string
//     rating: number
//     followers: string
//     bio: string
//     image: string
//     location: string
//     instagram: string
//     spotify: string
//     appleMusic: string
//   }
// }

// Remove unused ArtistCard component - it's not being used in the current implementation
// const ArtistCard = memo(function ArtistCard({ artist }: ArtistCardProps) {
//   return (
//     <Card className="p-4 bg-card border-border">
//       <div className="flex items-start gap-4">
//         <Image
//           src={artist.image || "/images/BandFallBack.PNG"}
//           alt={artist.artist}
//           width={80}
//           height={80}
//           className="rounded-lg object-cover"
//         />
//         
//         <div className="flex-1 space-y-2">
//           <div className="flex items-start justify-between">
//             <div>
//               <h3 className="font-semibold text-foreground">{artist.artist}</h3>
//               <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                 <Badge variant="outline" className="text-xs">
//                   {artist.genre}
//                 </Badge>
//                 <span className="flex items-center gap-1">
//                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                   {artist.rating}
//                 </span>
//                 <span>{artist.followers} followers</span>
//               </div>
//             </div>
//           </div>
//           
//           <p className="text-sm text-muted-foreground line-clamp-2">
//             {artist.bio}
//           </p>
//           
//           <div className="flex items-center gap-2 text-xs text-muted-foreground">
//             <MapPin className="w-3 h-3" />
//             <span>{artist.location}</span>
//           </div>
//           
//           <div className="flex items-center gap-2 pt-2">
//             <Button variant="outline" size="sm" className="text-xs flex-1">
//               <Heart className="w-3 h-3 mr-1" />
//               Favorite
//             </Button>
//           </div>
//           
//           <div className="flex items-center gap-2 pt-2">
//             <Button 
//               variant="outline" 
//               size="sm" 
//               className="text-xs"
//               onClick={() => window.open(artist.spotify, '_blank')}
//             >
//               <span className="text-green-600 font-semibold">♪</span>
//               <span className="ml-1">Spotify</span>
//             </Button>
//             <Button 
//               variant="outline" 
//               size="sm" 
//               className="text-xs"
//               onClick={() => window.open(artist.appleMusic, '_blank')}
//             >
//               <span className="text-pink-600 font-semibold">♫</span>
//               <span className="ml-1">Apple Music</span>
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Card>
//   )
// })

// Location Card Component for Fan Dashboard
interface LocationCardProps {
  location: {
    id: string
    name: string
    address: string
    capacity: string
    genres: string[]
    rating: number
    description: string
    image: string
    amenities: string[]
    phone: string
    instagram: string
  }
}

const LocationCard = memo(function LocationCard({ location }: LocationCardProps) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-start gap-4">
        <Image
          src={location.image}
          alt={location.name}
          width={80}
          height={80}
          className="rounded-lg object-cover"
        />
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{location.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {location.rating}
                </span>
                <span>•</span>
                <span>{location.capacity} capacity</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {location.description}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{location.address}</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {location.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
            {location.genres.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{location.genres.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <Button 
              variant="default"
              size="sm" 
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => window.open(`https://instagram.com/${location.instagram.replace('@', '')}`, '_blank')}
            >
              <span className="mr-1">📷</span>
              Instagram
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
})

export function FanDashboard() {
  const [activeTab, setActiveTab] = useState("discover")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [showTicketPurchase, setShowTicketPurchase] = useState(false)
  const [favoriteEvents, setFavoriteEvents] = useState<Set<string>>(new Set())
  const [selectedGenre, setSelectedGenre] = useState<string>("All Genres")
  const [isClient, setIsClient] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const userId = isClient ? (authUtils.getCurrentUser()?.id ?? "") : ""

  // Fetch real gigs from backend
  const { gigs, loading: gigsLoading, error: gigsError, refreshGigs } = useGigs()

  const [artists, setArtists] = useState<ArtistProfile[]>([])
  const [locations, setLocations] = useState<LocationProfile[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [myTickets, setMyTickets] = useState<any[]>([])

  useEffect(() => {
    artistApi.getAllArtists({ limit: 50 }).then(res => {
      if (res.success && res.data) setArtists(res.data)
    }).catch(() => {})
    locationApi.getAllLocations({ limit: 50 }).then(res => {
      if (res.success && res.data) setLocations(res.data)
    }).catch(() => {})
    ticketApi.getMyTickets().then(res => {
      if (res.success && res.data) setMyTickets(res.data)
    }).catch(() => {})
  }, [])

  // Mock favorite artists - in a real app, this would come from user preferences
  const favoriteArtists = useMemo(() => [
    "artist1", // The Blue Notes
    "artist2", // Urban Beats
    "artist3", // The Acoustic Trio
  ], [])

  // Convert favorite events to string array for the hook
  const favoriteEventIds = useMemo(() => 
    Array.from(favoriteEvents), 
    [favoriteEvents]
  )

  // Fan profile data - memoized for performance
  const fanProfileData = useMemo(() => {
    // Only get user data on the client side to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return {
        name: "Music Fan",
        email: "fan@example.com",
        location: "St. Augustine, FL"
      }
    }
    
    const currentUser = authUtils.getCurrentUser();
    
    return {
      name: currentUser ? authUtils.getUserFullName() : "Music Fan",
      email: currentUser?.email || "fan@example.com",
      location: "St. Augustine, FL"
    }
  }, [])

  const { name: fanName } = fanProfileData

  useEffect(() => {
    setIsClient(true)
    if (!authUtils.isAuthenticated()) {
      window.location.href = '/?redirect=/fan'
    } else {
      setAuthChecked(true)
    }
  }, [])

  // Initialize real-time functionality
  const {
    isConnected,
    subscribeToEvent,
    unsubscribeFromEvent
  } = useFanRealTime({
    userId,
    favoriteArtists,
    favoriteEvents: favoriteEventIds
  })

  // Debounce search query for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Map real artists from API to the shape ArtistListing expects
  const allArtists = useMemo(() => artists.map(a => ({
    id: a._id,
    artist: a.name,
    genre: Array.isArray(a.genre) ? a.genre[0] || "" : a.genre,
    rating: a.rating,
    followers: a.followers || "0",
    bio: a.bio,
    image: a.portfolioImages?.[0] || "/images/BandFallBack.PNG",
    location: a.location,
    instagram: a.instagram,
    spotify: a.spotify,
    appleMusic: a.appleMusic,
  })), [artists])

  // Map real locations from API to the shape the search listing expects
  const allLocations = useMemo(() => locations.map(l => ({
    id: l._id,
    name: l.name,
    address: l.address || `${l.city}, ${l.state}`,
    capacity: String(l.capacity),
    genres: l.tags || [],
    rating: l.rating,
    description: l.description || "",
    image: l.images?.[0] || "/images/venu-logo.png",
    amenities: l.amenities || [],
    phone: l.contactPhone,
    instagram: "",
  })), [locations])

  // Transform gigs data to match the expected event format
  const allEvents = useMemo(() => {
    return gigs.map(gig => {
      // Determine event status based on confirmed band count
      const confirmedBandsCount = gig.bands.filter(band => band.confirmed).length
      const needsMoreBands = confirmedBandsCount < gig.numberOfBands
      const eventStatus = needsMoreBands ? 'needs-bands' : 'complete'
      
      return {
        id: gig._id,
        artist: gig.bands.length > 0 ? gig.bands[0].name : "TBA",
        location: gig.selectedLocation?.name || "TBA",
        address: gig.selectedLocation?.address || `${gig.selectedLocation?.city}, ${gig.selectedLocation?.state}`,
        date: new Date(gig.eventDate).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        time: gig.eventTime,
        genre: gig.eventGenre,
        ticketPrice: gig.ticketPrice,
        ticketsRemaining: gig.ticketCapacity - gig.ticketsSold,
        totalTickets: gig.ticketCapacity,
        rating: gig.rating,
        description: `${gig.eventGenre} performance at ${gig.selectedLocation?.name || 'TBA'}`,
        image: gig.image || "/images/venu-logo.png",
        tags: gig.tags || [gig.eventGenre],
        status: gig.status,
        eventStatus, // Add computed status for UI
        needsMoreBands, // Add flag for easy checking
        expectedBands: gig.numberOfBands,
        confirmedBands: confirmedBandsCount,
        numberOfBands: gig.numberOfBands, // Add for event card
        bands: gig.bands, // Add for event card
        createdAt: gig.createdAt
      }
    })
  }, [gigs])

  const handleBuyTickets = useCallback((eventId: string) => {
    if (!authUtils.isAuthenticated()) {
      window.location.href = "/?redirect=/fan&action=buy-ticket"
      return
    }
    setSelectedEvent(eventId)
    setShowTicketPurchase(true)
  }, [])

  const toggleFavorite = useCallback((eventId: string) => {
    setFavoriteEvents(prevFavorites => {
      const newFavorites = new Set(prevFavorites)
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId)
        // Unsubscribe from real-time updates when removing from favorites
        unsubscribeFromEvent(eventId)
      } else {
        newFavorites.add(eventId)
        // Subscribe to real-time updates when adding to favorites
        subscribeToEvent(eventId)
      }
      return newFavorites
    })
  }, [subscribeToEvent, unsubscribeFromEvent])

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = event.artist.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        getLocationDisplayName(event.location).toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        event.genre.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      
      const matchesGenre = selectedGenre === "All Genres" || event.genre === selectedGenre
      
      return matchesSearch && matchesGenre
    })
  }, [allEvents, debouncedSearchQuery, selectedGenre])

  const filteredArtists = useMemo(() => {
    if (!debouncedSearchQuery && selectedGenre === "All Genres") {
      return allArtists // Return all if no filters for better performance
    }
    
    return allArtists.filter(artist => {
      const matchesSearch = !debouncedSearchQuery || 
        artist.artist.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        artist.genre.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        artist.location.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      
      const matchesGenre = selectedGenre === "All Genres" || artist.genre === selectedGenre
      
      return matchesSearch && matchesGenre
    })
  }, [allArtists, debouncedSearchQuery, selectedGenre])

  const filteredLocations = useMemo(() => {
    return allLocations.filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        location.genres.some(genre => genre.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      
      const matchesGenre = selectedGenre === "All Genres" || 
        location.genres.some(genre => genre === selectedGenre)
      
      return matchesSearch && matchesGenre
    })
  }, [allLocations, debouncedSearchQuery, selectedGenre])

  // Don't render until auth is confirmed (prevents flash for unauthenticated users)
  if (!authChecked) return null

  if (showTicketPurchase && selectedEvent) {
    const event = allEvents.find(e => e.id === selectedEvent)
    if (event) {
      return (
        <TicketPurchase
          eventId={event.id}
          onBack={() => {
            setShowTicketPurchase(false)
            setSelectedEvent(null)
          }}
          eventData={event}
        />
      )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Real-time Notifications */}
      <RealTimeFanNotifications
        userId={userId}
        favoriteArtists={favoriteArtists}
        favoriteEvents={favoriteEventIds}
      />

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
                {isClient && fanName ? `${fanName}'s Dashboard` : 'Fan Dashboard'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <MapPin className="w-4 h-4 mr-2" />
              St. Augustine, FL
            </Button>
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
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">
            <Compass className="w-4 h-4 mr-2" />
            Discover Events
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="w-4 h-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="my-tickets">
            <Ticket className="w-4 h-4 mr-2" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="w-4 h-4 mr-2" />
            Favorites
          </TabsTrigger>
        </TabsList>

        {/* Discover Events Tab */}
        <TabsContent value="discover" className="space-y-6">
          {/* Genre Filters */}
          <div className="space-y-4">
            <GenreFilters 
              selectedGenre={selectedGenre} 
              onGenreChange={setSelectedGenre} 
            />
          </div>

          {/* Events Grid - Vertical Layout for Better Date Prominence */}
          {gigsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : gigsError ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Error loading events</h3>
              <p className="text-muted-foreground mb-4">{gigsError}</p>
              <Button 
                onClick={refreshGigs}
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : filteredEvents.length > 0 ? (
          <VerticalEventsGrid
            events={filteredEvents}
            favoriteEvents={favoriteEvents}
            onToggleFavorite={toggleFavorite}
            onBuyTickets={handleBuyTickets}
            userId={userId}
          />
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">No events found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {selectedGenre !== "All Genres" 
                  ? `No events found for ${selectedGenre}. Try selecting a different genre.`
                  : "No events are currently available. Check back later for new events!"
                }
              </p>
            </div>
          )}
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-8">
          {/* Search Header */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Find Your Perfect Event</h2>
              <p className="text-muted-foreground">Search for artists, venues, or events in your area</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search artists, locations, or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-base border-2 focus:border-purple-500 focus:ring-purple-500"
                aria-label="Search for artists, venues, or events"
                role="searchbox"
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Search across artists, venues, and events. Results will appear as you type.
              </div>
            </div>
            
            {/* Genre Filters */}
            <div className="flex justify-center">
              <GenreFilters 
                selectedGenre={selectedGenre} 
                onGenreChange={setSelectedGenre} 
              />
            </div>
          </div>

          {/* Show results only when user has interacted */}
          {(debouncedSearchQuery || selectedGenre !== "All Genres") ? (
            <div className="space-y-12">
              {/* Search Results Summary */}
              <div className="text-center space-y-2" role="status" aria-live="polite">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Search className="w-4 h-4" />
                  <span>
                    {debouncedSearchQuery ? `Search results for "${debouncedSearchQuery}"` : `Filtered by ${selectedGenre}`}
                    {debouncedSearchQuery && selectedGenre !== "All Genres" && ` in ${selectedGenre}`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredArtists.length + filteredLocations.length + filteredEvents.length} total results
                </p>
                {searchQuery !== debouncedSearchQuery && (
                  <p className="text-xs text-muted-foreground animate-pulse" aria-live="assertive">
                    Searching...
                  </p>
                )}
              </div>

              {/* Artists Section */}
              <section className="space-y-6" aria-labelledby="artists-heading">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h2 id="artists-heading" className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full" aria-hidden="true"></span>
                    Artists
                  </h2>
                </div>
                
                <ArtistListing 
                  showSearch={true}
                  showFilters={true}
                  limit={6}
                  onArtistSelect={(artist) => {
                    // Handle artist selection - could open a modal or navigate to artist profile
                    console.log('Selected artist:', artist)
                  }}
                />
              </section>

              {/* Locations Section */}
              {filteredLocations.length > 0 && (
                <section className="space-y-6" aria-labelledby="venues-heading">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 id="venues-heading" className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></span>
                      Venues
                    </h2>
                    <Badge variant="secondary" className="text-xs" aria-label={`${filteredLocations.length} venues found`}>
                      {filteredLocations.length} found
                    </Badge>
                  </div>
                  
                  <div className="grid gap-6" role="list" aria-label="Venue search results">
                    {filteredLocations.map((location) => (
                      <div key={location.id} role="listitem">
                        <LocationCard location={location} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Events Section */}
              {filteredEvents.length > 0 && (
                <section className="space-y-6" aria-labelledby="events-heading">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 id="events-heading" className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true"></span>
                      Events
                    </h2>
                    <Badge variant="secondary" className="text-xs" aria-label={`${filteredEvents.length} events found`}>
                      {filteredEvents.length} found
                    </Badge>
                  </div>
                  
                  <div role="list" aria-label="Event search results">
                    <RealTimeEventsGrid
                      events={filteredEvents}
                      favoriteEvents={favoriteEvents}
                      onToggleFavorite={toggleFavorite}
                      onBuyTickets={handleBuyTickets}
                      userId={userId}
                    />
                  </div>
                </section>
              )}
              
              {/* No results */}
              {filteredArtists.length === 0 && filteredLocations.length === 0 && filteredEvents.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">No results found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {debouncedSearchQuery 
                      ? `We couldn't find anything matching "${debouncedSearchQuery}". Try adjusting your search terms or genre filter.`
                      : "No results found for the selected genre filter. Try selecting a different genre."
                    }
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
                    <span>Try searching for:</span>
                    <Button variant="outline" size="sm" onClick={() => setSearchQuery("jazz")} className="text-xs">
                      jazz
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSearchQuery("The Blue Notes")} className="text-xs">
                      The Blue Notes
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSearchQuery("Muggsy's Bar")} className="text-xs">
                      Muggsy&apos;s Bar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty state when no search/filter is active */
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-8">
                <Search className="w-12 h-12 text-purple-600" />
              </div>
              <h2 className="text-3xl font-semibold text-foreground mb-4">Discover Amazing Events</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
                Use the search bar above to find artists, venues, or events, or select a genre filter to discover new music in your area.
              </p>
            </div>
          )}
        </TabsContent>

        {/* My Tickets Tab */}
        <TabsContent value="my-tickets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myTickets.length === 0 && (
              <p className="text-muted-foreground text-sm col-span-2">No tickets yet. Buy tickets to see them here.</p>
            )}
            {myTickets.map((ticket) => {
              const gig = ticket.gigId || {}
              const eventDate = gig.eventDate
                ? new Date(gig.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                : "—"
              const isValid = ticket.status === 'valid'
              return (
                <Card key={ticket._id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Ticket className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{gig.eventName || "Event"}</h3>
                        <p className="text-sm text-muted-foreground">{gig.selectedLocation?.name || "Venue TBA"}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {eventDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {gig.eventTime || "—"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">General Admission × {ticket.quantity}</p>
                          <p className="text-sm text-muted-foreground">${ticket.totalPrice}</p>
                        </div>
                        <Badge variant={isValid ? 'default' : 'secondary'} className={isValid ? 'bg-purple-600 text-white' : ''}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {ticket.qrCode && (
                    <div className="mt-4 flex justify-center">
                      <div className="bg-white p-3 rounded-lg inline-block">
                        <Image src={ticket.qrCode} alt="QR Code" width={100} height={100} unoptimized />
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="default" size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="default" size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-6">
          {gigsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : gigsError ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Error loading events</h3>
              <p className="text-muted-foreground mb-4">{gigsError}</p>
              <Button 
                onClick={refreshGigs}
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : favoriteEvents.size > 0 ? (
            <RealTimeEventsGrid
              events={allEvents.filter(event => favoriteEvents.has(event.id))}
              favoriteEvents={favoriteEvents}
              onToggleFavorite={toggleFavorite}
              onBuyTickets={handleBuyTickets}
              userId={userId}
              showDescription={false}
              buttonVariant="purple"
            />
          ) : (
            <div className="col-span-full text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
              <p className="text-muted-foreground">Start exploring events and add them to your favorites!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 