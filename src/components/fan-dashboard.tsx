"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, MapPin, Calendar, Star, Heart, Share2, Ticket, Users, Clock, Download } from "lucide-react"
import Image from "next/image"
import { TicketPurchase } from "./ticket-purchase"
import { getLocationDisplayName } from "@/lib/location-data"

export function FanDashboard() {
  const [activeTab, setActiveTab] = useState("discover")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [showTicketPurchase, setShowTicketPurchase] = useState(false)
  const [favoriteEvents, setFavoriteEvents] = useState<Set<number>>(new Set())

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
      } else {
        newFavorites.add(eventId)
      }
      return newFavorites
    })
  }, [])

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event =>
      event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getLocationDisplayName(event.location).toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.genre.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allEvents, searchQuery])

  if (showTicketPurchase && selectedEvent) {
    const event = allEvents.find(e => e.id.toString() === selectedEvent)
    return (
      <TicketPurchase
        eventId={selectedEvent}
        onBack={() => {
          setShowTicketPurchase(false)
          setSelectedEvent(null)
        }}
        eventData={event}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-serif font-bold text-2xl">Fan Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <MapPin className="w-4 h-4 mr-2" />
              St. Augustine, FL
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover Events</TabsTrigger>
          <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        {/* Discover Events Tab */}
        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search events, artists, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Badge variant="secondary" className="whitespace-nowrap">All Genres</Badge>
              <Badge variant="outline" className="whitespace-nowrap">Jazz</Badge>
              <Badge variant="outline" className="whitespace-nowrap">Rock</Badge>
              <Badge variant="outline" className="whitespace-nowrap">Electronic</Badge>
              <Badge variant="outline" className="whitespace-nowrap">Folk</Badge>
              <Badge variant="outline" className="whitespace-nowrap">Blues</Badge>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={event.image}
                    alt={event.artist}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background/90"
                    onClick={() => toggleFavorite(event.id)}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favoriteEvents.has(event.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                    />
                  </Button>
                  <Badge className="absolute top-2 left-2 bg-primary/90 text-white">
                    ${event.ticketPrice}
                  </Badge>
                </div>
                
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">{event.artist}</h3>
                    <p className="text-sm text-muted-foreground">{getLocationDisplayName(event.location)}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{event.genre}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {event.rating}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {event.ticketsRemaining} tickets left
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setSelectedEvent(event.id.toString())
                        setShowTicketPurchase(true)
                      }}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Buy Tickets
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
                      <Badge variant={ticket.status === 'confirmed' ? 'default' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents
              .filter(event => favoriteEvents.has(event.id))
              .map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={event.image}
                      alt={event.artist}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background/90"
                      onClick={() => toggleFavorite(event.id)}
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </Button>
                    <Badge className="absolute top-2 left-2 bg-primary/90 text-white">
                      ${event.ticketPrice}
                    </Badge>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{event.artist}</h3>
                      <p className="text-sm text-muted-foreground">{getLocationDisplayName(event.location)}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{event.genre}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {event.rating}
                      </div>
                    </div>
                    
                    <Button 
                      variant="purple"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSelectedEvent(event.id.toString())
                        setShowTicketPurchase(true)
                      }}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Buy Tickets
                    </Button>
                  </div>
                </Card>
              ))}
            
            {favoriteEvents.size === 0 && (
              <div className="col-span-full text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
                <p className="text-muted-foreground">Start exploring events and add them to your favorites!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 