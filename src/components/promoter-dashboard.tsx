"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Users, TrendingUp, DollarSign, Star, Eye, ArrowLeft, ArrowRight, Check, Building2, Filter, Search, BarChart3, Clock, MapPin, Instagram, Music, FileText, MessageCircle, MoreHorizontal } from "lucide-react"
import Image from "next/image"
import { TIME_OPTIONS, GENRE_OPTIONS, getTimeLabel, GIG_STEPS } from "@/lib/constants"

export function PromoterDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showPostGig, setShowPostGig] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Schedule tab subcategory state
  const [scheduleSubcategory, setScheduleSubcategory] = useState("list")
  
  // Filter state for schedule views
  const [scheduleFilter, setScheduleFilter] = useState("all") // "all", "complete", "needs-bands"
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Unavailable dates state (dates when venues are closed or unavailable)
  const [unavailableDates, setUnavailableDates] = useState<string[]>(() => {
    // Load from localStorage or use default values
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('promoter-unavailable-dates')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
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
  
  // Form state
  const [eventName, setEventName] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [eventGenre, setEventGenre] = useState("")
  const [ticketCapacity, setTicketCapacity] = useState("")
  const [selectedLocationForGig, setSelectedLocationForGig] = useState("")
  
  const [selectedDoorPerson, setSelectedDoorPerson] = useState("")
  const [doorPersonEmail, setDoorPersonEmail] = useState("")
  
  const [requirements, setRequirements] = useState<Array<{ id: string; text: string; checked: boolean }>>([])
  const [requirementsInput, setRequirementsInput] = useState("")
  
  const [bands, setBands] = useState<Array<{ id: string; name: string; genre: string; setTime: string; percentage: string; email: string }>>([])
  const [bandName, setBandName] = useState("")
  const [bandGenre, setBandGenre] = useState("")
  const [bandSetTime, setBandSetTime] = useState("")
  const [bandPercentage, setBandPercentage] = useState("")
  const [bandEmail, setBandEmail] = useState("")
  
  const [guarantee, setGuarantee] = useState("")
  const [numberOfBands, setNumberOfBands] = useState("")
  
  // Saved door persons state
  const [savedDoorPersons, setSavedDoorPersons] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [newDoorPersonName, setNewDoorPersonName] = useState("")
  const [newDoorPersonEmail, setNewDoorPersonEmail] = useState("")

  // Memoized calculations
  const bandsTotal = useMemo(() => 
    bands.reduce((sum, band) => sum + (parseFloat(band.percentage) || 0), 0), 
    [bands]
  )

  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return eventName.trim() && eventDate && eventTime && eventGenre && ticketCapacity.trim() && selectedLocationForGig && numberOfBands.trim()
      case 2:
        return bands.length > 0
      case 3:
        return guarantee.trim() && bandsTotal <= 100
      case 4:
        return true // Optional step
      default:
        return true
    }
  }, [currentStep, eventName, eventDate, eventTime, eventGenre, ticketCapacity, selectedLocationForGig, numberOfBands, bands, guarantee, bandsTotal])

  // Memoized mock data for locations the promoter works with
  const myLocations = useMemo(() => [
    {
      id: "location1",
      name: "The Blue Note",
      location: "New York, NY",
      type: "Jazz Club",
      eventsCount: 12,
      revenue: "$8.2K",
      image: "/images/venu-logo.png",
    },
    {
      id: "location2",
      name: "Electric Factory",
      location: "Philadelphia, PA",
      type: "Concert Hall",
      eventsCount: 8,
      revenue: "$15.7K",
      image: "/images/venu-logo.png",
    },
    {
      id: "location3",
      name: "The Basement",
      location: "Nashville, TN",
      type: "Live Music Bar",
      eventsCount: 15,
      revenue: "$6.8K",
      image: "/images/venu-logo.png",
    },
  ], [])

  // Memoized mock data for upcoming events across all locations
  const upcomingEvents = useMemo(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
    
    return [
      {
        id: 1,
        artist: "The Midnight Keys",
        location: "The Blue Note",
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-15`,
        time: "8 PM doors",
        genre: "Jazz",
        ticketsSold: 50,
        totalTickets: 75,
        status: "live",
        revenue: "$600",
        image: "/images/venu-logo.png",
        expectedBands: 3,
        confirmedBands: 3,
      },
      {
        id: 2,
        artist: "Electric Pulse",
        location: "Electric Factory",
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-22`,
        time: "9 PM",
        genre: "Electronic",
        ticketsSold: 0,
        totalTickets: 100,
        status: "posted",
        revenue: "$0",
        image: "/images/venu-logo.png",
        expectedBands: 4,
        confirmedBands: 2,
      },
      {
        id: 3,
        artist: "Acoustic Souls",
        location: "The Basement",
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-08`,
        time: "7 PM",
        genre: "Folk",
        ticketsSold: 45,
        totalTickets: 60,
        status: "completed",
        revenue: "$350",
        image: "/images/venu-logo.png",
        expectedBands: 2,
        confirmedBands: 2,
      },
      {
        id: 4,
        artist: "Luna & The Waves",
        location: "The Blue Note",
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-28`,
        time: "7:30 PM",
        genre: "Indie Rock",
        ticketsSold: 12,
        totalTickets: 80,
        status: "posted",
        revenue: "$120",
        image: "/images/venu-logo.png",
        expectedBands: 3,
        confirmedBands: 1,
      },
    ];
  }, [])

  // Memoized mock data for artist applications across all locations
  const artistApplications = useMemo(() => [
    {
      id: 1,
      artist: "Luna & The Waves",
      location: "The Blue Note",
      genre: "Indie Rock",
      followers: "2.3K",
      rating: 4.7,
      bio: "Dreamy indie rock with ethereal vocals and atmospheric soundscapes.",
      appliedFor: "Jazz Night - Oct 25",
      status: "pending",
      image: "/images/venu-logo.png",
    },
    {
      id: 2,
      artist: "Jazz Collective",
      location: "The Blue Note",
      genre: "Jazz",
      followers: "1.8K",
      rating: 4.9,
      bio: "Modern jazz ensemble bringing fresh energy to classic standards.",
      appliedFor: "Jazz Night - Oct 25",
      status: "approved",
      image: "/images/venu-logo.png",
    },
    {
      id: 3,
      artist: "Rock Solid",
      location: "Electric Factory",
      genre: "Rock",
      followers: "5.1K",
      rating: 4.6,
      bio: "High-energy rock band with powerful vocals and driving rhythms.",
      appliedFor: "Rock Show - Nov 2",
      status: "pending",
      image: "/images/venu-logo.png",
    },
  ], [])

  // Mock data for local artists in Discover tab
  const localArtists = useMemo(() => [
    {
      id: "local1",
      artist: "The Blue Notes",
      genre: "Jazz",
      rating: 4.7,
      followers: "3.2K",
      bio: "Local jazz ensemble specializing in smooth jazz and contemporary arrangements. Regular performers at downtown venues.",
      image: "/images/BandFallBack.PNG",
      location: "Downtown",
      priceRange: "$200-400",
      availability: "Available this month",
      instagram: "@thebluenotesjazz",
      spotify: "https://open.spotify.com/artist/thebluenotes",
      appleMusic: "https://music.apple.com/artist/the-blue-notes/123456789",
    },
    {
      id: "local2",
      artist: "Urban Beats",
      genre: "Hip-Hop",
      rating: 4.5,
      followers: "5.1K",
      bio: "Dynamic hip-hop collective bringing fresh beats and powerful lyrics. Known for high-energy performances.",
      image: "/images/BandFallBack.PNG",
      location: "Midtown",
      priceRange: "$300-500",
      availability: "Available next week",
      instagram: "@urbanbeatscrew",
      spotify: "https://open.spotify.com/artist/urbanbeats",
      appleMusic: "https://music.apple.com/artist/urban-beats/987654321",
    },
    {
      id: "local3",
      artist: "Acoustic Soul",
      genre: "Folk",
      rating: 4.8,
      followers: "2.8K",
      bio: "Intimate folk duo with haunting harmonies and storytelling lyrics. Perfect for intimate venue settings.",
      image: "/images/BandFallBack.PNG",
      location: "Westside",
      priceRange: "$150-300",
      availability: "Available this month",
      instagram: "@acousticsoulmusic",
      spotify: "https://open.spotify.com/artist/acousticsoul",
      appleMusic: "https://music.apple.com/artist/acoustic-soul/456789123",
    },
    {
      id: "local4",
      artist: "Electric Dreams",
      genre: "Electronic",
      rating: 4.6,
      followers: "4.2K",
      bio: "Ambient electronic music with live instrumentation. Creates immersive soundscapes for modern venues.",
      image: "/images/BandFallBack.PNG",
      location: "Eastside",
      priceRange: "$250-450",
      availability: "Available next month",
      instagram: "@electricdreamsband",
      spotify: "https://open.spotify.com/artist/electricdreams",
      appleMusic: "https://music.apple.com/artist/electric-dreams/789123456",
    },
  ], [])

  // Memoized filter events based on selected location, search query, and schedule filter
  const filteredEvents = useMemo(() => {
    let events = upcomingEvents.filter(event => {
      const locationMatch = selectedLocation === "all" || event.location === myLocations.find(v => v.id === selectedLocation)?.name
      const searchMatch = event.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.genre.toLowerCase().includes(searchQuery.toLowerCase())
      return locationMatch && searchMatch
    })

    // Apply schedule filter
    if (scheduleFilter === "complete") {
      events = events.filter(event => event.status === "completed" || event.status === "live")
    } else if (scheduleFilter === "needs-bands") {
      events = events.filter(event => event.status === "posted" && event.ticketsSold === 0)
    }

    return events
  }, [upcomingEvents, selectedLocation, searchQuery, myLocations, scheduleFilter])

  // Memoized filter applications based on selected location and search query
  const filteredApplications = useMemo(() => {
    return artistApplications.filter(app => {
      const locationMatch = selectedLocation === "all" || app.location === myLocations.find(v => v.id === selectedLocation)?.name
      const searchMatch = app.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.genre.toLowerCase().includes(searchQuery.toLowerCase())
      return locationMatch && searchMatch
    })
  }, [artistApplications, selectedLocation, searchQuery, myLocations])

  // Filter locations based on selected location
  const filteredLocations = selectedLocation === "all" 
    ? myLocations 
    : myLocations.filter(location => location.id === selectedLocation)

  // Filter upcoming events for overview stats
  const filteredUpcomingEvents = selectedLocation === "all" 
    ? upcomingEvents 
    : upcomingEvents.filter(event => event.location === myLocations.find(v => v.id === selectedLocation)?.name)

  // Filter artist applications for overview stats
  const filteredArtistApplications = selectedLocation === "all" 
    ? artistApplications 
    : artistApplications.filter(app => app.location === myLocations.find(v => v.id === selectedLocation)?.name)

  const handleRequirementsKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const text = requirementsInput.trim()
      if (text) {
        const newRequirement = {
          id: Date.now().toString(),
          text: text,
          checked: false
        }
        setRequirements(prevRequirements => [...prevRequirements, newRequirement])
        setRequirementsInput("")
      }
    }
  }, [requirementsInput])

  const toggleRequirement = useCallback((id: string) => {
    setRequirements(prevRequirements => 
      prevRequirements.map(req => 
        req.id === id ? { ...req, checked: !req.checked } : req
      )
    )
  }, [])

  const removeRequirement = useCallback((id: string) => {
    setRequirements(prevRequirements => prevRequirements.filter(req => req.id !== id))
  }, [])

  const addBand = useCallback(() => {
    if (bandName.trim() && bandGenre.trim() && bandSetTime.trim() && bandPercentage.trim() && bandEmail.trim()) {
      const newBand = {
        id: Date.now().toString(),
        name: bandName.trim(),
        genre: bandGenre.trim(),
        setTime: bandSetTime.trim(),
        percentage: bandPercentage.trim(),
        email: bandEmail.trim()
      }
      
      // Use functional update to prevent stale closure issues
      setBands(prevBands => {
        const updatedBands = [...prevBands, newBand]
        return updatedBands.sort((a, b) => a.setTime.localeCompare(b.setTime))
      })
      
      // Reset form fields
      setBandName("")
      setBandGenre("")
      setBandSetTime("")
      setBandPercentage("")
      setBandEmail("")
    }
  }, [bandName, bandGenre, bandSetTime, bandPercentage, bandEmail])

  const removeBand = useCallback((id: string) => {
    setBands(prevBands => prevBands.filter(band => band.id !== id))
  }, [])

  // Door person management functions
  const addDoorPerson = useCallback(() => {
    if (newDoorPersonName.trim() && newDoorPersonEmail.trim()) {
      const newDoorPerson = {
        id: Date.now().toString(),
        name: newDoorPersonName.trim(),
        email: newDoorPersonEmail.trim()
      }
      setSavedDoorPersons(prev => [...prev, newDoorPerson])
      setNewDoorPersonName("")
      setNewDoorPersonEmail("")
    }
  }, [newDoorPersonName, newDoorPersonEmail])

  const removeDoorPerson = useCallback((id: string) => {
    setSavedDoorPersons(prev => prev.filter(doorPerson => doorPerson.id !== id))
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < GIG_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const canProceedToNext = useCallback(() => {
    return canProceedToNextStep
  }, [canProceedToNextStep])

  const resetForm = useCallback(() => {
    setCurrentStep(1)
    setEventName("")
    setEventDate("")
    setEventTime("")
    setEventGenre("")
    setTicketCapacity("")
    setSelectedLocationForGig("")
    setNumberOfBands("")
    setSelectedDoorPerson("")
    setDoorPersonEmail("")
    setRequirements([])
    setBands([])
    setGuarantee("")
    setBandEmail("")
  }, [])

  const handlePublish = useCallback(() => {
    // Here you would typically send the data to your backend
    // Data would be sent to backend API here
    
    // Reset and close
    resetForm()
    setShowPostGig(false)
  }, [eventName, eventDate, eventTime, eventGenre, ticketCapacity, selectedLocationForGig, numberOfBands, selectedDoorPerson, doorPersonEmail, requirements, bands, guarantee, resetForm])

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
        localStorage.setItem('promoter-unavailable-dates', JSON.stringify(newDates))
      }
      
      return newDates
    })
  }, [])

  if (showPostGig) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" onClick={() => setShowPostGig(false)}>
              Cancel
            </Button>
            <h1 className="font-serif font-bold text-lg">Post a Gig</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="sticky top-16 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="p-4">
            <div className="max-w-6xl mx-auto">
              {/* Step Numbers and Titles */}
              <div className="flex items-start justify-between mb-6 relative">
                {/* Continuous Background Line */}
                <div className="absolute top-6 left-0 right-0 h-3 bg-muted-foreground rounded-full -z-10"></div>
                
                {/* Progress Line Overlay */}
                <div 
                  className="absolute top-6 left-0 h-3 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all duration-500 ease-out -z-10"
                  style={{ 
                    width: `${Math.min(((currentStep - 1) / (GIG_STEPS.length - 1)) * 100, 100)}%`,
                    boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)'
                  }}
                ></div>
                
                {GIG_STEPS.map((step) => {
                  const isCompleted = currentStep > step.id;
                  const isActive = currentStep === step.id;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center flex-1 relative z-10">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mb-4 transition-all duration-300 relative z-20 ${
                        isCompleted
                          ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/50' 
                          : isActive
                          ? 'border-purple-600 text-purple-600 bg-white shadow-lg shadow-purple-600/30' 
                          : 'border-muted-foreground text-muted-foreground bg-background'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <span className="font-medium">{step.id}</span>
                        )}
                      </div>
                      
                      {/* Title and Description */}
                      <div className="text-center px-2 min-h-[4rem] flex flex-col justify-center">
                        <h3 className={`text-sm font-medium leading-tight mb-1 ${
                          isActive
                            ? 'text-purple-600 font-semibold' 
                            : isCompleted
                            ? 'text-foreground font-semibold' 
                            : 'text-muted-foreground'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-xs leading-tight ${
                          isActive
                            ? 'text-purple-600/80' 
                            : isCompleted
                            ? 'text-muted-foreground' 
                            : 'text-muted-foreground/60'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Current Step Highlight */}
              <div className="text-center mb-4">
                <h2 className="font-semibold text-foreground text-lg">{GIG_STEPS[currentStep - 1].title}</h2>
                <p className="text-sm text-muted-foreground">{GIG_STEPS[currentStep - 1].description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-4 max-w-2xl mx-auto">
          {/* Step 1: Event Details */}
          {currentStep === 1 && (
          <Card className="p-6 bg-card border-border">
            <div className="space-y-4">

              
              <div>
                <Label htmlFor="event-name" className="text-foreground">
                  Event Name
                </Label>
                <Input
                  id="event-name"
                  placeholder="e.g. Jazz Night at The Blue Note"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  className="mt-2 bg-input border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-foreground">
                  Location
                </Label>
                <Select value={selectedLocationForGig} onValueChange={setSelectedLocationForGig}>
                  <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {myLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                                  <div>
                    <Label htmlFor="date" className="text-foreground">
                      Date
                    </Label>
                    <div className="relative mt-2">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input 
                        id="date" 
                        type="date" 
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="pl-10 bg-input border-border text-foreground cursor-pointer hover:bg-accent/50 hover:border-primary/50 focus:bg-accent/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 ease-in-out" 
                        onClick={() => {
                          const dateInput = document.getElementById('date') as HTMLInputElement;
                          if (dateInput) {
                            dateInput.showPicker();
                          }
                        }}
                      />
                      <div className="absolute inset-0 pointer-events-none rounded-md" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to open calendar picker
                    </p>
                  </div>
                <div>
                  <Label htmlFor="time" className="text-foreground">
                    Time
                  </Label>
                    <Select value={eventTime} onValueChange={setEventTime}>
                    <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                      <SelectValue placeholder="Select event time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="19:00">7:00 PM - Doors Open</SelectItem>
                      <SelectItem value="19:30">7:30 PM - First Act</SelectItem>
                      <SelectItem value="20:00">8:00 PM</SelectItem>
                      <SelectItem value="20:30">8:30 PM</SelectItem>
                      <SelectItem value="21:00">9:00 PM</SelectItem>
                      <SelectItem value="21:30">9:30 PM</SelectItem>
                      <SelectItem value="22:00">10:00 PM</SelectItem>
                      <SelectItem value="22:30">10:30 PM</SelectItem>
                      <SelectItem value="23:00">11:00 PM</SelectItem>
                      <SelectItem value="23:30">11:30 PM</SelectItem>
                      <SelectItem value="00:00">12:00 AM</SelectItem>
                      <SelectItem value="00:30">12:30 AM</SelectItem>
                      <SelectItem value="01:00">1:00 AM</SelectItem>
                      <SelectItem value="01:30">1:30 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="genre" className="text-foreground">
                  Preferred Genre
                </Label>
                  <Select value={eventGenre} onValueChange={setEventGenre}>
                  <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="folk">Folk</SelectItem>
                    <SelectItem value="blues">Blues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                  <Label htmlFor="capacity" className="text-foreground">
                    Ticket Capacity
                    </Label>
                    <Input
                    id="capacity"
                    type="number"
                    placeholder="e.g. 100"
                    value={ticketCapacity}
                    onChange={(e) => setTicketCapacity(e.target.value)}
                      className="mt-2 bg-input border-border text-foreground"
                    />
                  </div>
              
              <div>
                <Label htmlFor="numberOfBands" className="text-foreground">
                  Number of Bands
                </Label>
                <Input
                  id="numberOfBands"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="e.g. 3"
                  value={numberOfBands}
                  onChange={(e) => setNumberOfBands(e.target.value)}
                  className="mt-2 bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Total number of bands expected for this gig
                </p>
              </div>
              </div>
            </Card>
          )}

          {/* Step 2: Lineup */}
          {currentStep === 2 && (
            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
              <div>
                <Label className="text-foreground">Bands/Artists</Label>
                {numberOfBands && (
                  <div className="mt-2 mb-4 p-3 bg-muted/20 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Expected bands:</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {numberOfBands} {parseInt(numberOfBands) === 1 ? 'band' : 'bands'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-muted-foreground">Added so far:</span>
                      <Badge variant={bands.length >= parseInt(numberOfBands) ? "default" : "secondary"} 
                             className={bands.length >= parseInt(numberOfBands) ? "bg-green-600 text-white" : ""}>
                        {bands.length} {bands.length === 1 ? 'band' : 'bands'}
                      </Badge>
                    </div>
                    {parseInt(numberOfBands) > bands.length && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">Bands still needed:</span>
                        <Badge variant="destructive" className="bg-orange-100 text-orange-700 border-orange-200">
                          {parseInt(numberOfBands) - bands.length} {parseInt(numberOfBands) - bands.length === 1 ? 'band' : 'bands'}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-2 space-y-3">
                  <div className="space-y-3">
                    <Input
                      placeholder="Band name"
                      value={bandName}
                      onChange={(e) => setBandName(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                    <Select value={bandGenre} onValueChange={setBandGenre}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="folk">Folk</SelectItem>
                        <SelectItem value="blues">Blues</SelectItem>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label htmlFor="band-set-time" className="text-foreground">
                      Set Time
                    </Label>
                    <Select value={bandSetTime} onValueChange={setBandSetTime}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select set time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="19:00">7:00 PM - Doors Open</SelectItem>
                        <SelectItem value="19:30">7:30 PM - First Act</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                        <SelectItem value="20:30">8:30 PM</SelectItem>
                        <SelectItem value="21:00">9:00 PM</SelectItem>
                        <SelectItem value="21:30">9:30 PM</SelectItem>
                        <SelectItem value="22:00">10:00 PM</SelectItem>
                        <SelectItem value="22:30">10:30 PM</SelectItem>
                        <SelectItem value="23:00">11:00 PM</SelectItem>
                        <SelectItem value="23:30">11:30 PM</SelectItem>
                        <SelectItem value="00:00">12:00 AM</SelectItem>
                        <SelectItem value="00:30">12:30 AM</SelectItem>
                        <SelectItem value="01:00">1:00 AM</SelectItem>
                        <SelectItem value="01:30">1:30 AM</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Payout Percentage (e.g., 30)"
                      value={bandPercentage}
                      onChange={(e) => setBandPercentage(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                       <Input
                         placeholder="Artist email address"
                         type="email"
                         value={bandEmail}
                         onChange={(e) => setBandEmail(e.target.value)}
                         className="bg-input border-border text-foreground"
                       />
                  </div>
                  <Button 
                    type="button" 
                    onClick={addBand} 
                    variant="default" 
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!bandName.trim() || !bandGenre.trim() || !bandSetTime.trim() || !bandPercentage.trim() || !bandEmail.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Band
                  </Button>
                </div>

                                 {bands.length > 0 && (
                   <div className="mt-6">
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                         <Users className="w-4 h-4 text-primary" />
                       </div>
                       <Label className="text-lg font-semibold text-foreground">Set Times</Label>
                       <Badge variant="secondary" className="ml-auto">
                         {bands.length} {bands.length === 1 ? 'Artist' : 'Artists'}
                       </Badge>
                     </div>
                     
                     <div className="space-y-4">
                       {bands.map((band, index) => (
                         <div key={band.id} className="group relative bg-gradient-to-r from-card to-accent/5 border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-200">
                           {/* Position Badge */}
                           <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                             <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                           </div>
                           
                           <div className="flex items-start justify-between">
                             <div className="flex-1 space-y-4">
                               {/* Band Header */}
                               <div className="flex items-start gap-4">
                                 <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                                   <span className="text-lg font-bold text-primary">🎵</span>
                                 </div>
                                 <div className="flex-1">
                                   <h4 className="text-lg font-bold text-foreground mb-2">{band.name}</h4>
                                   <div className="flex items-center gap-3">
                                     <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                       {band.genre}
                                     </Badge>
                                     <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                       <Clock className="w-4 h-4" />
                                       <span className="font-medium">
                                         {band.setTime === "19:00" ? "7:00 PM - Doors" : 
                                          band.setTime === "19:30" ? "7:30 PM - First Act" :
                                          band.setTime === "20:00" ? "8:00 PM" :
                                          band.setTime === "20:30" ? "8:30 PM" :
                                          band.setTime === "21:00" ? "9:00 PM" :
                                          band.setTime === "21:30" ? "9:30 PM" :
                                          band.setTime === "22:00" ? "10:00 PM" :
                                          band.setTime === "22:30" ? "10:30 PM" :
                                          band.setTime === "23:00" ? "11:00 PM" :
                                          band.setTime === "23:30" ? "11:30 PM" :
                                          band.setTime === "00:00" ? "12:00 AM" :
                                          band.setTime === "00:30" ? "12:30 AM" :
                                          band.setTime === "01:00" ? "1:00 AM" :
                                          band.setTime === "01:30" ? "1:30 AM" : band.setTime}
                                       </span>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                               
                               {/* Details Grid */}
                               <div className="grid grid-cols-2 gap-4">
                                 <div className="bg-accent/20 rounded-lg p-3">
                                   <div className="flex items-center gap-2 mb-1">
                                     <DollarSign className="w-4 h-4 text-green-600" />
                                     <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Payout</span>
                                   </div>
                                   <span className="text-xl font-bold text-green-600">{band.percentage}%</span>
                                 </div>
                                 
                                 <div className="bg-accent/20 rounded-lg p-3">
                                   <div className="flex items-center gap-2 mb-1">
                                     <span className="w-4 h-4 bg-muted rounded-full flex items-center justify-center">
                                       <span className="text-xs font-medium">@</span>
                                     </span>
                                     <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</span>
                                   </div>
                                   <span className="text-sm font-mono text-foreground break-all">{band.email}</span>
                                 </div>
                               </div>
                             </div>
                             
                             {/* Remove Button */}
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => removeBand(band.id)}
                               className="opacity-0 group-hover:opacity-100 h-10 w-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-200"
                             >
                               <span className="text-lg">×</span>
                             </Button>
                           </div>
                           
                           {/* Subtle border accent */}
                           <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-b-xl"></div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
              </div>
            </Card>
          )}

          {/* Step 3: Payout Structure */}
          {currentStep === 3 && (
            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
              <div>
                <Label htmlFor="guarantee" className="text-foreground">
                  Guaranteed Minimum
                </Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="guarantee"
                    type="number"
                    placeholder="200"
                    value={guarantee}
                    onChange={(e) => setGuarantee(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  if no guarantee write 0
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Payout Summary</Label>
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bands Total:</span>
                    <span className="text-foreground font-medium">
                      {bands.reduce((sum, band) => sum + (parseFloat(band.percentage) || 0), 0)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-2">
                    <span className="text-foreground font-medium">Promoter Remainder:</span>
                    <span className="text-foreground font-medium">
                      {Math.max(0, 100 - bands.reduce((sum, band) => sum + (parseFloat(band.percentage) || 0), 0))}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Promoter receives any remaining percentage after bands
                </p>
              </div>
            </div>
          </Card>
          )}

          {/* Step 4: Staff & Requirements */}
          {currentStep === 4 && (
            <div className="space-y-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Door Person</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="door-person" className="text-foreground">
                  Door Person
                </Label>
                <Select value={selectedDoorPerson} onValueChange={setSelectedDoorPerson}>
                  <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select door person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">SELF</SelectItem>
                    {savedDoorPersons.map((doorPerson) => (
                      <SelectItem key={doorPerson.id} value={doorPerson.id}>
                        {doorPerson.name} ({doorPerson.email})
                      </SelectItem>
                    ))}
                    <SelectItem value="add-by-email">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add by email
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {selectedDoorPerson === "add-by-email" && (
                  <div className="mt-3">
                    <Label htmlFor="door-person-email" className="text-sm text-muted-foreground">
                      Door Person Email
                    </Label>
                    <Input
                      id="door-person-email"
                      type="email"
                      placeholder="Enter door person's email address"
                      value={doorPersonEmail}
                      onChange={(e) => setDoorPersonEmail(e.target.value)}
                      className="mt-2 bg-input border-border text-foreground"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Requirements</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="requirements" className="text-foreground">
                  Artist Requirements
                </Label>
                <Textarea
                  id="requirements"
                  placeholder="Type a requirement and press Enter to add it to the list..."
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                  onKeyDown={handleRequirementsKeyDown}
                  className="mt-2 bg-input border-border text-foreground min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Press Enter to add each requirement as a separate item
                </p>
              </div>
              
              {requirements.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">Requirements List:</Label>
                  {requirements.map((requirement) => (
                    <div key={requirement.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <input
                        type="checkbox"
                        checked={requirement.checked}
                        onChange={() => toggleRequirement(requirement.id)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      />
                      <span className={`flex-1 text-sm ${requirement.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {requirement.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(requirement.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
            </div>
          )}

          {/* Step 5: Review & Publish */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <Card className="p-6 bg-card border-border">
                <h3 className="font-semibold text-foreground mb-4">Event Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event Name:</span>
                    <span className="text-foreground font-medium">{eventName}</span>
                  </div>
                  <div className="flex justify-between">
                                          <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground font-medium">
                      {myLocations.find(v => v.id === selectedLocationForGig)?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span className="text-foreground font-medium">{eventDate} at {eventTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Genre:</span>
                    <span className="text-foreground font-medium">{eventGenre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="text-foreground font-medium">{ticketCapacity} tickets</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bands:</span>
                    <span className="text-foreground font-medium">{bands.length} artists</span>
                  </div>
                  {numberOfBands && parseInt(numberOfBands) > bands.length && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bands still needed:</span>
                      <span className="text-orange-600 font-medium">
                        {parseInt(numberOfBands) - bands.length} {parseInt(numberOfBands) - bands.length === 1 ? 'band' : 'bands'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guarantee:</span>
                    <span className="text-foreground font-medium">${guarantee || 0}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="font-semibold text-foreground mb-4">Payout Breakdown</h3>
                <div className="space-y-2">
                  {bands.map((band) => (
                    <div key={band.id} className="flex justify-between">
                      <span className="text-muted-foreground">{band.name}:</span>
                      <span className="text-foreground font-medium">{band.percentage}%</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-foreground font-medium">Promoter:</span>
                    <span className="text-foreground font-medium">
                      {Math.max(0, 100 - bands.reduce((sum, band) => sum + (parseFloat(band.percentage) || 0), 0))}%
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < GIG_STEPS.length ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={!canProceedToNext()}
                  className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Publish Gig
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image src="/images/venu-logo.png" alt="Venu" width={32} height={32} className="rounded-lg w-8 h-8" />
            <span className="font-serif font-bold text-xl">Promoter Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Promoter Dashboard
            </Badge>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Location
            </Button>
            <Button variant="purple" onClick={() => setShowPostGig(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Post Gig
            </Button>
          </div>
        </div>
      </div>

      {/* Location Selector */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium text-muted-foreground">Working with:</Label>
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

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-6 bg-card border-b border-border rounded-none h-12">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
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

        {/* Overview Tab */}
        <TabsContent value="overview" className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">Dashboard Overview</h2>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events, artists, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-background"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-card border-border text-center">
              <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{filteredLocations.length}</div>
              <div className="text-sm text-muted-foreground">Active Locations</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{filteredUpcomingEvents.length}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{filteredArtistApplications.length}</div>
              <div className="text-sm text-muted-foreground">Applications</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                ${filteredLocations.reduce((sum, location) => {
                  const revenue = parseFloat(location.revenue.replace(/[$,]/g, ''))
                  return sum + revenue
                }, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </Card>
          </div>

          {/* Locations Overview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">My Locations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="p-4 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={location.image}
                      alt={location.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover w-12 h-12"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{location.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {location.location}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">{location.type}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Events:</span>
                      <span className="text-foreground font-medium">{location.eventsCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="text-green-400 font-medium">{location.revenue}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Recent Activity</h3>
            <Card className="p-4 bg-card border-border">
              <div className="space-y-3">
                {selectedLocation === "all" ? (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">2 hours ago</span>
                      <span className="text-foreground">New application from "Rock Solid" for Electric Factory</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">1 day ago</span>
                      <span className="text-foreground">Event "Jazz Night" at The Blue Note went live</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">3 days ago</span>
                      <span className="text-foreground">Revenue milestone reached at The Basement</span>
                    </div>
                  </>
                ) : (
                  <>
                    {filteredUpcomingEvents.length > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Recent</span>
                        <span className="text-foreground">
                          {filteredUpcomingEvents.length} event{filteredUpcomingEvents.length !== 1 ? 's' : ''} at {filteredLocations[0]?.name}
                        </span>
                      </div>
                    )}
                    {filteredArtistApplications.length > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Recent</span>
                        <span className="text-foreground">
                          {filteredArtistApplications.length} application{filteredArtistApplications.length !== 1 ? 's' : ''} received
                        </span>
                      </div>
                    )}
                    {filteredLocations.length > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="text-foreground">
                          ${filteredLocations[0]?.revenue} generated at {filteredLocations[0]?.name}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">Discover Local Artists</h2>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search artists..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-input border-border text-foreground"
              />
              <Button variant="outline" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {localArtists.map((artist) => (
              <Card key={artist.id} className="p-4 bg-card border-border">
                <div className="flex items-start gap-4">
                  <Image
                    src={artist.image || "/images/BandFallBack.PNG"}
                    alt={artist.artist}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{artist.artist}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {artist.genre}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-foreground">{artist.rating}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm text-foreground">{artist.location}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {artist.followers}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {artist.priceRange}
                      </span>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                        {artist.availability}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>

                    {/* Social Media Links */}
                    <div className="flex items-center gap-4 pt-2 pb-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Instagram className="w-4 h-4" />
                        <a 
                          href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 hover:underline"
                        >
                          {artist.instagram}
                        </a>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Music className="w-4 h-4" />
                        <div className="flex gap-2">
                          <a 
                            href={artist.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 hover:underline"
                          >
                            Spotify
                          </a>
                          <span className="text-muted-foreground">•</span>
                          <a 
                            href={artist.appleMusic}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-gray-200 hover:underline"
                          >
                            Apple Music
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="default" size="sm" className="w-28 bg-purple-600 hover:bg-purple-700 text-white">
                        View Details
                      </Button>
                      <Button variant="default" size="sm" className="w-20 bg-purple-600 hover:bg-purple-700 text-white">
                        Book
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">Schedule</h2>
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

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button 
              variant={scheduleFilter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleFilter("all")}
              className={`whitespace-nowrap ${scheduleFilter === "all" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
            >
              All Events
            </Button>
            <Button 
              variant={scheduleFilter === "complete" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleFilter("complete")}
              className={`whitespace-nowrap ${scheduleFilter === "complete" ? "bg-green-600 hover:bg-green-700 text-white" : "border-green-200 text-green-700 hover:bg-green-50"}`}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Complete
            </Button>
            <Button 
              variant={scheduleFilter === "needs-bands" ? "default" : "outline"} 
              size="sm"
              onClick={() => setScheduleFilter("needs-bands")}
              className={`whitespace-nowrap ${scheduleFilter === "needs-bands" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "border-yellow-200 text-yellow-700 hover:bg-yellow-50"}`}
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
              Needs Bands
            </Button>
          </div>

          {/* List View Subcategory */}
          {scheduleSubcategory === "list" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-foreground">My Events</h3>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredEvents.length} of {upcomingEvents.length} events
                </div>
              </div>

              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const progress = (event.ticketsSold / event.totalTickets) * 100
                  const isComplete = event.status === "completed" || event.status === "live"
                  const needsBands = event.status === "posted" && event.ticketsSold === 0

                  return (
                    <Card key={event.id} className="p-4 bg-card border-border">
                      <div className="flex gap-4">
                        <Image
                          src={event.image}
                          alt={event.artist}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover w-20 h-20"
                        />

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{event.artist}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="w-4 h-4" />
                                {event.location}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {event.date} - {event.time}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  event.status === "live" ? "default" : event.status === "completed" ? "secondary" : "outline"
                                }
                                className={
                                  event.status === "live" ? "bg-green-600" : event.status === "posted" ? "bg-primary" : ""
                                }
                              >
                                {event.status}
                              </Badge>
                              <div className="text-sm text-green-400 font-medium mt-1">
                                {event.revenue}
                              </div>
                            </div>
                          </div>

                          {/* Ticket Sales Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Ticket Sales</span>
                              <span className="text-foreground font-medium">
                                {event.ticketsSold}/{event.totalTickets}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {event.genre}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Calendar View Subcategory */}
          {scheduleSubcategory === "calendar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-foreground">Calendar View</h3>
                <div className="text-sm text-muted-foreground">
                  {scheduleFilter === "unavailable" 
                    ? `Showing ${unavailableDates.length} unavailable dates`
                    : scheduleFilter === "available"
                    ? `Showing available dates`
                    : scheduleFilter === "all"
                    ? `Showing all dates (available and unavailable)`
                    : `Showing ${filteredEvents.length} of ${upcomingEvents.length} events`
                  }
                </div>
              </div>

              {/* Calendar-specific filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button 
                  variant={scheduleFilter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setScheduleFilter("all")}
                  className={`whitespace-nowrap ${scheduleFilter === "all" ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-purple-200 text-purple-700 hover:bg-purple-50"}`}
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                  All Dates
                </Button>
                <Button 
                  variant={scheduleFilter === "unavailable" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setScheduleFilter("unavailable")}
                  className={`whitespace-nowrap ${scheduleFilter === "unavailable" ? "bg-red-600 hover:bg-red-700 text-white" : "border-red-200 text-red-700 hover:bg-red-50"}`}
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  Unavailable
                </Button>
                <Button 
                  variant={scheduleFilter === "available" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setScheduleFilter("available")}
                  className={`whitespace-nowrap ${scheduleFilter === "available" ? "bg-gray-600 hover:bg-gray-700 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                >
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                  Available
                </Button>
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
                    Events from {selectedLocation === "all" ? "all locations" : myLocations.find(v => v.id === selectedLocation)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
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
                    
                    // Check if this date has an event (considering filter)
                    const eventOnDate = filteredEvents.find(event => {
                      const eventDate = new Date(event.date);
                      return eventDate.getDate() === day && 
                             eventDate.getMonth() === currentMonth && 
                             eventDate.getFullYear() === currentYear;
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
                    
                    // Determine if event needs more bands
                    const needsMoreBands = eventOnDate && eventOnDate.expectedBands > eventOnDate.confirmedBands;
                    
                    // For unavailable filter, only show unavailable days
                    if (scheduleFilter === "unavailable" && !isUnavailable) {
                      return <div key={i} className="h-20 bg-muted/20 rounded-lg"></div>;
                    }
                    
                    // For available filter, only show available days (no events, not unavailable, not past)
                    if (scheduleFilter === "available" && (eventOnDate || isUnavailable || isPast)) {
                      return <div key={i} className="h-20 bg-muted/20 rounded-lg"></div>;
                    }
                    
                    if (!isCurrentMonth) {
                      return <div key={i} className="h-20 bg-muted/20 rounded-lg"></div>;
                    }
                    
                    return (
                      <div 
                        key={i} 
                        onClick={() => {
                          // Only allow toggling availability for future dates that don't have events
                          if (!isPast && !eventOnDate) {
                            toggleDateAvailability(dateString)
                          }
                        }}
                        className={`h-20 p-2 rounded-lg border transition-all duration-200 ${
                          !isPast && !eventOnDate 
                            ? 'cursor-pointer hover:shadow-md' 
                            : 'cursor-default'
                        } ${
                          isToday 
                            ? 'bg-purple-600 border-purple-600 shadow-md' 
                            : isUnavailable
                            ? scheduleFilter === "unavailable"
                              ? 'bg-red-50 border-red-300 shadow-md' 
                              : 'bg-white border-red-200'
                            : eventOnDate && needsMoreBands
                            ? 'bg-white border-yellow-200'
                            : eventOnDate
                            ? 'bg-white border-green-200' 
                            : isPast 
                            ? 'bg-white border-muted' 
                            : 'bg-white border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 relative z-10 ${
                          isToday 
                            ? 'text-white' 
                            : isUnavailable
                            ? scheduleFilter === "unavailable"
                              ? 'text-red-700 font-bold'
                              : 'text-red-600'
                            : eventOnDate && needsMoreBands
                            ? 'text-yellow-600'
                            : eventOnDate 
                            ? 'text-green-600' 
                            : isPast 
                            ? 'text-muted-foreground' 
                            : 'text-gray-900 font-semibold'
                        }`}>
                          {day}
                        </div>
                        
                        {eventOnDate && (
                          <div className="space-y-1">
                            {filteredEvents
                              .filter(event => {
                                const eventDate = new Date(event.date);
                                return eventDate.getDate() === day && 
                                       eventDate.getMonth() === currentMonth && 
                                       eventDate.getFullYear() === currentYear;
                              })
                              .map((event, index) => (
                                <div 
                                  key={event.id} 
                                  className={`text-xs p-1 rounded ${
                                    needsMoreBands
                                      ? 'bg-yellow-200 text-yellow-800' 
                                      : 'bg-green-200 text-green-800'
                                  }`}
                                >
                                  <div className="font-medium">{event.artist}</div>
                                  <div className="text-xs text-muted-foreground">{event.location}</div>
                                  {needsMoreBands && (
                                    <div className="text-xs font-bold mt-0.5">
                                      Need {event.expectedBands - event.confirmedBands} more
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                        
                        {!eventOnDate && !isPast && !isUnavailable && (
                          <div className={`text-xs mt-1 font-medium ${
                            isToday ? 'text-white' : 'text-gray-600'
                          }`}>
                            Available
                          </div>
                        )}
                        
                        {!eventOnDate && !isPast && isUnavailable && (
                          <div className={`text-xs mt-2 font-medium ${
                            isToday 
                              ? 'text-white'
                              : scheduleFilter === "unavailable"
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
                    <span className="text-green-600 font-medium">Complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                    <span className="text-yellow-600 font-medium">Bands Still Needed</span>
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
            <h2 className="font-serif font-bold text-xl">Artist Applications</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select>
                <SelectTrigger className="w-32 bg-background">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Applications</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredApplications.map((artist) => (
              <Card key={artist.id} className="p-4 bg-card border-border">
                <div className="flex gap-4">
                  <Image
                    src={artist.image || "/images/BandFallBack.PNG"}
                    alt={artist.artist}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover w-15 h-15"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{artist.artist}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-foreground">{artist.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {artist.genre}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {artist.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {artist.followers}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>
                    
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Applied for:</span> {artist.appliedFor}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="w-24 bg-transparent">
                        Decline
                      </Button>
                      <Button variant="purple" size="sm" className="w-24">
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">Venue Chat</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {selectedLocation === "all" ? "All Venues" : myLocations.find(v => v.id === selectedLocation)?.name}
              </Badge>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-4">
            <Card className="p-4 bg-card border-border">
              <div className="space-y-4">
                {selectedLocation === "all" ? (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">Select a Venue</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a specific venue from the location filter to view venue-specific chat messages.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Sample Chat Messages */}
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">JD</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">John Doe</span>
                            <span className="text-xs text-muted-foreground">2 hours ago</span>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <p className="text-sm text-foreground">
                              Hey! Just wanted to confirm the sound check time for tomorrow's jazz night. 
                              Can we get in at 6 PM?
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <div className="flex-1 max-w-xs">
                          <div className="flex items-center gap-2 mb-1 justify-end">
                            <span className="text-xs text-muted-foreground">1 hour ago</span>
                            <span className="text-sm font-medium text-foreground">You</span>
                          </div>
                          <div className="bg-purple-600 text-white rounded-lg p-3">
                            <p className="text-sm">
                              Absolutely! 6 PM works perfectly. The sound system will be ready and tested by then.
                            </p>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">P</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">SM</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">Sarah Manager</span>
                            <span className="text-xs text-muted-foreground">30 minutes ago</span>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <p className="text-sm text-foreground">
                              Thanks for the quick response! Also, we have a new artist interested in 
                              playing next month. Should I send you their demo?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-border pt-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          className="flex-1 bg-background"
                        />
                        <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Recent Conversations */}
            {selectedLocation !== "all" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Recent Conversations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: 1,
                      name: "The Blue Note Team",
                      lastMessage: "Sound check confirmed for 6 PM",
                      time: "2 hours ago",
                      unread: 0,
                    },
                    {
                      id: 2,
                      name: "Electric Factory Staff",
                      lastMessage: "New artist demo ready for review",
                      time: "1 day ago",
                      unread: 2,
                    },
                    {
                      id: 3,
                      name: "The Basement Crew",
                      lastMessage: "Equipment list updated",
                      time: "3 days ago",
                      unread: 0,
                    },
                  ].map((conversation) => (
                    <Card key={conversation.id} className="p-4 bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground">{conversation.name}</h4>
                            {conversation.unread > 0 && (
                              <Badge variant="default" className="bg-purple-600 text-white text-xs">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{conversation.lastMessage}</p>
                          <span className="text-xs text-muted-foreground">{conversation.time}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* More Tab */}
        <TabsContent value="more" className="p-4 space-y-6">
          <h2 className="font-serif font-bold text-xl">More</h2>
          
          {/* Analytics Section */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-foreground">Analytics</h3>

            {/* Overall Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-card border-border text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {selectedLocation === "all" ? "92%" : "85%"}
                </div>
                <div className="text-sm text-muted-foreground">Avg Fill Rate</div>
              </Card>
              <Card className="p-4 bg-card border-border text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  ${filteredLocations.reduce((sum, location) => {
                    const revenue = parseFloat(location.revenue.replace(/[$,]/g, ''))
                    return sum + revenue
                  }, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </Card>
              <Card className="p-4 bg-card border-border text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {filteredUpcomingEvents.reduce((sum, event) => sum + event.ticketsSold, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Tickets Sold</div>
              </Card>
            </div>

            {/* Location Performance Comparison */}
            <Card className="p-4 bg-card border-border">
              <h4 className="font-semibold text-foreground mb-4">Location Performance</h4>
              <div className="space-y-4">
                {filteredLocations.map((location) => (
                  <div key={location.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={location.image}
                        alt={location.name}
                        width={32}
                        height={32}
                        className="rounded-lg object-cover w-8 h-8"
                      />
                      <div>
                        <span className="text-sm font-medium text-foreground">{location.name}</span>
                        <div className="text-xs text-muted-foreground">{location.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-foreground">{location.eventsCount}</div>
                        <div className="text-muted-foreground">Events</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-400">{location.revenue}</div>
                        <div className="text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-foreground">85%</div>
                        <div className="text-muted-foreground">Fill Rate</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Genre Performance */}
            <Card className="p-4 bg-card border-border">
              <h4 className="font-semibold text-foreground mb-4">Genre Performance Across Locations</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Jazz</span>
                  <div className="flex items-center gap-2">
                    <Progress value={88} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">88%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rock</span>
                  <div className="flex items-center gap-2">
                    <Progress value={72} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">72%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Electronic</span>
                  <div className="flex items-center gap-2">
                    <Progress value={65} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">65%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Folk</span>
                  <div className="flex items-center gap-2">
                    <Progress value={78} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">78%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Monthly Trends */}
            <Card className="p-4 bg-card border-border">
              <h4 className="font-semibold text-foreground mb-4">Monthly Trends</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue growth</span>
                  <span className="text-green-400">+18% vs last month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event count</span>
                  <span className="text-blue-400">+5 new events</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Artist applications</span>
                  <span className="text-yellow-400">+23% increase</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average rating</span>
                  <span className="text-foreground">4.7/5.0</span>
                </div>
              </div>
            </Card>
          </div>
          
          <Card className="p-4 bg-card border-border">
            <h3 className="font-semibold text-foreground mb-4">Manage Door Persons</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-foreground">Door Person Name</Label>
                  <Input 
                    placeholder="Enter door person name" 
                    value={newDoorPersonName}
                    onChange={(e) => setNewDoorPersonName(e.target.value)}
                    className="mt-1 bg-input border-border text-foreground" 
                  />
                </div>
                <div>
                  <Label className="text-sm text-foreground">Email Address</Label>
                  <Input 
                    placeholder="Enter email address" 
                    type="email"
                    value={newDoorPersonEmail}
                    onChange={(e) => setNewDoorPersonEmail(e.target.value)}
                    className="mt-1 bg-input border-border text-foreground" 
                  />
                </div>
              </div>
              <Button 
                onClick={addDoorPerson}
                disabled={!newDoorPersonName.trim() || !newDoorPersonEmail.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Door Person
              </Button>
              
              {savedDoorPersons.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Saved Door Persons</Label>
                  <div className="space-y-2">
                    {savedDoorPersons.map((doorPerson) => (
                      <div key={doorPerson.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="font-medium text-foreground">{doorPerson.name}</div>
                          <div className="text-sm text-muted-foreground">{doorPerson.email}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDoorPerson(doorPerson.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 