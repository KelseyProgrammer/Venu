"use client"

import { useState, useMemo, useCallback, memo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, MapPin, Star, Share2, Clock, Heart, Ticket, Download, Compass } from "lucide-react"
import Image from "next/image"
import { TicketPurchase } from "./ticket-purchase"
import { getLocationDisplayName } from "@/lib/location-data"
import { GenreFilters } from "./genre-filters"
import { EventsGrid } from "./events-grid"
import { ArtistListing } from "./artist-listing"
import { RealTimeFanNotifications } from "./real-time-fan-notifications"
import { RealTimeEventCard } from "./real-time-event-card"
import { RealTimeEventsGrid } from "./real-time-events-grid"
import { useFanRealTime } from "@/hooks/useFanRealTime"

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
  const [favoriteEvents, setFavoriteEvents] = useState<Set<number>>(new Set())
  const [selectedGenre, setSelectedGenre] = useState<string>("All Genres")

  // Mock user ID - in a real app, this would come from authentication
  const userId = "fan-user-123"
  
  // Mock favorite artists - in a real app, this would come from user preferences
  const favoriteArtists = useMemo(() => [
    "artist1", // The Blue Notes
    "artist2", // Urban Beats
    "artist3", // The Acoustic Trio
  ], [])

  // Convert favorite events to string array for the hook
  const favoriteEventIds = useMemo(() => 
    Array.from(favoriteEvents).map(id => id.toString()), 
    [favoriteEvents]
  )

  // Initialize real-time functionality
  const {
    isConnected,
    error: realTimeError,
    subscribeToEvent,
    unsubscribeFromEvent,
    subscribeToArtist,
    unsubscribeFromArtist
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

  // Memoized artist data for search
  const allArtists = useMemo(() => [
    {
      id: "artist1",
      artist: "The Blue Notes",
      genre: "Jazz",
      rating: 4.7,
      followers: "3.2K",
      bio: "Local jazz ensemble specializing in smooth jazz and contemporary arrangements. Regular performers at downtown venues.",
      image: "/images/BandFallBack.PNG",
      location: "Downtown",
      instagram: "@thebluenotesjazz",
      spotify: "https://open.spotify.com/artist/thebluenotes",
      appleMusic: "https://music.apple.com/artist/the-blue-notes/123456789",
    },
    {
      id: "artist2",
      artist: "Urban Beats",
      genre: "Hip-Hop",
      rating: 4.5,
      followers: "4.8K",
      bio: "Dynamic hip-hop collective bringing fresh beats and powerful lyrics. Known for high-energy performances.",
      image: "/images/BandFallBack.PNG",
      location: "East Side",
      instagram: "@urbanbeatscrew",
      spotify: "https://open.spotify.com/artist/urbanbeats",
      appleMusic: "https://music.apple.com/artist/urban-beats/987654321",
    },
    {
      id: "artist3",
      artist: "The Acoustic Trio",
      genre: "Folk",
      rating: 4.9,
      followers: "2.1K",
      bio: "Intimate acoustic performances with beautiful harmonies. Perfect for smaller venues and intimate settings.",
      image: "/images/BandFallBack.PNG",
      location: "West End",
      instagram: "@acoustictrio",
      spotify: "https://open.spotify.com/artist/acoustictrio",
      appleMusic: "https://music.apple.com/artist/the-acoustic-trio/456789123",
    },
    {
      id: "artist4",
      artist: "Electric Storm",
      genre: "Electronic",
      rating: 4.6,
      followers: "6.7K",
      bio: "Electronic music producers and DJs creating immersive soundscapes. Perfect for late-night events.",
      image: "/images/BandFallBack.PNG",
      location: "Midtown",
      instagram: "@electricstormmusic",
      spotify: "https://open.spotify.com/artist/electricstorm",
      appleMusic: "https://music.apple.com/artist/electric-storm/789123456",
    },
    {
      id: "artist5",
      artist: "The Soul Collective",
      genre: "R&B",
      rating: 4.8,
      followers: "5.4K",
      bio: "Soulful R&B group with powerful vocals and smooth instrumentals. Brings the house down every performance.",
      image: "/images/BandFallBack.PNG",
      location: "South Side",
      instagram: "@soulcollective",
      spotify: "https://open.spotify.com/artist/soulcollective",
      appleMusic: "https://music.apple.com/artist/the-soul-collective/321654987",
    },
    {
      id: "artist6",
      artist: "The Midnight Keys",
      genre: "Jazz",
      rating: 4.8,
      followers: "2.1K",
      bio: "Smooth jazz quartet with over 10 years of experience performing at prestigious locations across the country.",
      image: "/images/BandFallBack.PNG",
      location: "Downtown",
      instagram: "@midnightkeysjazz",
      spotify: "https://open.spotify.com/artist/midnightkeys",
      appleMusic: "https://music.apple.com/artist/the-midnight-keys/111222333",
    },
    {
      id: "artist7",
      artist: "Electric Pulse",
      genre: "Electronic",
      rating: 4.6,
      followers: "5.3K",
      bio: "High-energy electronic duo specializing in house and techno. Known for creating immersive dance experiences.",
      image: "/images/BandFallBack.PNG",
      location: "Midtown",
      instagram: "@electricpulse",
      spotify: "https://open.spotify.com/artist/electricpulse",
      appleMusic: "https://music.apple.com/artist/electric-pulse/444555666",
    },
  ], [])

  // Memoized location data for search
  const allLocations = useMemo(() => [
    {
      id: "loc1",
      name: "Muggsy's Bar",
      address: "213 W King St, St. Augustine, FL 32084",
      capacity: "75",
      genres: ["Jazz", "Blues", "Rock"],
      rating: 4.6,
      description: "Intimate downtown bar known for live jazz and craft cocktails. Perfect for acoustic performances.",
      image: "/images/MUGS.jpeg",
      amenities: ["Full Bar", "Outdoor Seating", "Parking"],
      phone: "(904) 555-0123",
      instagram: "@muggysbar",
    },
    {
      id: "loc2", 
      name: "Sarbez",
      address: "115 Anastasia Blvd, St. Augustine, FL 32080",
      capacity: "100",
      genres: ["Electronic", "Hip-Hop", "Alternative"],
      rating: 4.4,
      description: "Vibrant venue with eclectic atmosphere, known for electronic music and late-night events.",
      image: "/images/SARBEZ.jpg",
      amenities: ["Dance Floor", "Light Show", "Food Menu"],
      phone: "(904) 555-0456",
      instagram: "@sarbez",
    },
    {
      id: "loc3",
      name: "Alfred's",
      address: "222 West King Street, St. Augustine, FL 32084",
      capacity: "50",
      genres: ["Folk", "Acoustic", "Jazz"],
      rating: 4.8,
      description: "Cozy cellar setting perfect for intimate acoustic performances and folk music.",
      image: "/images/Alfreds.jpg",
      amenities: ["Intimate Setting", "Wine Selection", "Historic Building"],
      phone: "(904) 555-0789",
      instagram: "@alfredsstaugustine",
    },
    {
      id: "loc4",
      name: "The Underground",
      address: "Downtown District, St. Augustine, FL",
      capacity: "80",
      genres: ["Rock", "Metal", "Alternative"],
      rating: 4.5,
      description: "Underground venue perfect for high-energy rock performances and alternative music.",
      image: "/images/MUGS.jpeg",
      amenities: ["Full Stage", "Sound System", "Bar"],
      phone: "(904) 555-0321",
      instagram: "@undergroundstaug",
    },
    {
      id: "loc5",
      name: "Riverfront Blues",
      address: "Waterfront District, St. Augustine, FL",
      capacity: "120",
      genres: ["Blues", "Jazz", "Soul"],
      rating: 4.7,
      description: "Beautiful waterfront venue with stunning views, perfect for blues and soul performances.",
      image: "/images/SARBEZ.jpg",
      amenities: ["Waterfront Views", "Outdoor Stage", "Full Kitchen"],
      phone: "(904) 555-0654",
      instagram: "@riverfrontblues",
    },
  ], [])

  // Memoized mock events data
  const allEvents = useMemo(() => [
    {
      id: 1,
      artist: "Uncle Marty",
      location: "muggys", // Use standardized location key
      address: "213 W King St, St. Augustine, FL 32084",
      date: "Sat, Oct 12",
      time: "8 PM doors",
      genre: "Jazz",
      ticketPrice: 25,
      ticketsRemaining: 25,
      totalTickets: 75,
      rating: 4.8,
      description: "An intimate evening of modern jazz in the heart of downtown.",
      image: "/images/MUGS.jpeg",
      tags: ["Live Music", "Intimate Location", "Craft Cocktails"],
    },
    {
      id: 2,
      artist: "86 Hope",
      location: "sarbez", // Use standardized location key
      address: "115 Anastasia Blvd, St. Augustine, FL 32080",
      date: "Wed, Oct 16",
      time: "9 PM",
      genre: "Electronic",
      ticketPrice: 20,
      ticketsRemaining: 45,
      totalTickets: 100,
      rating: 4.5,
      description: "High-energy electronic beats and immersive light show.",
      image: "/images/SARBEZ.jpg",
      tags: ["Electronic", "Light Show", "Dance"],
    },
    {
      id: 3,
      artist: "Naum",
      location: "alfreds", // Use standardized location key
      address: "222 West King Street, St. Augustine, FL 32084",
      date: "Fri, Oct 18",
      time: "7 PM",
      genre: "Folk",
      ticketPrice: 30,
      ticketsRemaining: 100,
      totalTickets: 100,
      rating: 4.9,
      description: "Intimate folk music in a cozy cellar setting.",
      image: "/images/Alfreds.jpg",
      tags: ["Folk", "Acoustic", "Intimate"],
    },
    {
      id: 4,
      artist: "Rock Revolution",
      location: "The Underground",
      address: "Downtown District",
      date: "Sat, Oct 19",
      time: "10 PM",
      genre: "Rock",
      ticketPrice: 35,
      ticketsRemaining: 15,
      totalTickets: 80,
      rating: 4.7,
      description: "High-octane rock performance with full band setup.",
      image: "/images/MUGS.jpeg",
      tags: ["Rock", "Full Band", "High Energy"],
    },
    {
      id: 5,
      artist: "Blues Brothers",
      location: "Riverfront Blues",
      address: "Waterfront",
      date: "Sun, Oct 20",
      time: "6 PM",
      genre: "Blues",
      ticketPrice: 28,
      ticketsRemaining: 60,
      totalTickets: 120,
      rating: 4.6,
      description: "Authentic blues music with riverfront views.",
      image: "/images/SARBEZ.jpg",
      tags: ["Blues", "Riverfront", "Sunset"],
    },
  ], [])

  const myTickets = useMemo(() => [
    {
      id: 1,
      artist: "The Midnight Keys",
      location: "Muggsy's Bar",
      date: "Sat, Oct 12",
      time: "8 PM doors",
      ticketType: "General Admission",
      price: 25,
      status: "confirmed",
      qrCode: "ticket-123",
      image: "/images/MUGS.jpeg",
    },
    {
      id: 2,
      artist: "Electric Pulse",
      location: "Sarbez",
      date: "Wed, Oct 16",
      time: "9 PM",
      ticketType: "General Admission",
      price: 20,
      status: "confirmed",
      qrCode: "ticket-456",
      image: "/images/SARBEZ.jpg",
    },
  ], [])

  const toggleFavorite = useCallback((eventId: number) => {
    setFavoriteEvents(prevFavorites => {
      const newFavorites = new Set(prevFavorites)
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId)
        // Unsubscribe from real-time updates when removing from favorites
        unsubscribeFromEvent(eventId.toString())
      } else {
        newFavorites.add(eventId)
        // Subscribe to real-time updates when adding to favorites
        subscribeToEvent(eventId.toString())
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
    return allArtists.filter(artist => {
      const matchesSearch = artist.artist.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
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

  if (showTicketPurchase && selectedEvent) {
    const event = allEvents.find(e => e.id.toString() === selectedEvent)
    if (event) {
      return (
        <TicketPurchase
          eventId={event.id.toString()}
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
          <h1 className="font-serif font-bold text-2xl">Fan Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <MapPin className="w-4 h-4 mr-2" />
              St. Augustine, FL
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

          {/* Events Grid */}
          <RealTimeEventsGrid
            events={filteredEvents}
            favoriteEvents={favoriteEvents}
            onToggleFavorite={toggleFavorite}
            onBuyTickets={(eventId) => {
              setSelectedEvent(eventId)
              setShowTicketPurchase(true)
            }}
            userId={userId}
          />
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
                      onBuyTickets={(eventId) => {
                        setSelectedEvent(eventId)
                        setShowTicketPurchase(true)
                      }}
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
            {myTickets.map((ticket) => (
              <Card key={ticket.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Image
                    src={ticket.image}
                    alt={ticket.artist}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{ticket.artist}</h3>
                      <p className="text-sm text-muted-foreground">{ticket.location}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {ticket.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {ticket.time}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{ticket.ticketType}</p>
                        <p className="text-sm text-muted-foreground">${ticket.price}</p>
                      </div>
                      <Badge variant={ticket.status === 'confirmed' ? 'default' : 'secondary'} className={ticket.status === 'confirmed' ? 'bg-purple-600 text-white' : ''}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
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
            ))}
          </div>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-6">
          {favoriteEvents.size > 0 ? (
            <RealTimeEventsGrid
              events={allEvents.filter(event => favoriteEvents.has(event.id))}
              favoriteEvents={favoriteEvents}
              onToggleFavorite={toggleFavorite}
              onBuyTickets={(eventId) => {
                setSelectedEvent(eventId)
                setShowTicketPurchase(true)
              }}
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