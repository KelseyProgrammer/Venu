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
import { Calendar, Plus, Users, TrendingUp, DollarSign, Star, Eye, ArrowLeft, ArrowRight, Check, Building2, Filter, Search, BarChart3, Clock, MapPin } from "lucide-react"
import Image from "next/image"

// Step configuration
const GIG_STEPS = [
  { id: 1, title: "Event Details", description: "Basic event information" },
  { id: 2, title: "Lineup", description: "Bands and scheduling" },
  { id: 3, title: "Payout", description: "Financial structure" },
  { id: 4, title: "Staff & Requirements", description: "Team and artist needs" },
  { id: 5, title: "Review", description: "Final review and publish" }
]

// Shared data constants
const TIME_OPTIONS = [
  { value: "19:00", label: "7:00 PM - Doors Open" },
  { value: "19:30", label: "7:30 PM - First Act" },
  { value: "20:00", label: "8:00 PM" },
  { value: "20:30", label: "8:30 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "21:30", label: "9:30 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "22:30", label: "10:30 PM" },
  { value: "23:00", label: "11:00 PM" },
  { value: "23:30", label: "11:30 PM" },
  { value: "00:00", label: "12:00 AM" },
  { value: "00:30", label: "12:30 AM" },
  { value: "01:00", label: "1:00 AM" },
  { value: "01:30", label: "1:30 AM" }
]

const GENRE_OPTIONS = [
  { value: "jazz", label: "Jazz" },
  { value: "rock", label: "Rock" },
  { value: "electronic", label: "Electronic" },
  { value: "folk", label: "Folk" },
  { value: "blues", label: "Blues" },
  { value: "pop", label: "Pop" },
  { value: "hip-hop", label: "Hip-Hop" },
  { value: "country", label: "Country" }
]

// Helper function to get time label
const getTimeLabel = (timeValue: string): string => {
  return TIME_OPTIONS.find(option => option.value === timeValue)?.label || timeValue
}

export function LocationDashboard() {
  const [activeTab, setActiveTab] = useState("events")
  const [showPostGig, setShowPostGig] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form state
  const [eventName, setEventName] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [eventGenre, setEventGenre] = useState("")
  const [ticketCapacity, setTicketCapacity] = useState("")
  
  const [selectedPromoter, setSelectedPromoter] = useState("")
  const [promoterEmail, setPromoterEmail] = useState("")
  const [promoterPercentage, setPromoterPercentage] = useState("")
  
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

  // Memoized calculations
  const bandsTotal = useMemo(() => 
    bands.reduce((sum, band) => sum + (parseFloat(band.percentage) || 0), 0), 
    [bands]
  )

  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return eventName.trim() && eventDate && eventTime && eventGenre && ticketCapacity.trim() && selectedPromoter
      case 2:
        return bands.length > 0
      case 3:
        return guarantee.trim() && (parseFloat(promoterPercentage) || 0) + bandsTotal <= 100
      case 4:
        return true // Optional step
      default:
        return true
    }
  }, [currentStep, eventName, eventDate, eventTime, eventGenre, ticketCapacity, selectedPromoter, bands, guarantee, promoterPercentage, bandsTotal])

  // Mock data for promoters the location works with
  const myPromoters = useMemo(() => [
    {
      id: "promoter1",
      name: "Jazz Promotions LLC",
      location: "New York, NY",
      type: "Jazz Specialist",
      eventsCount: 8,
      revenue: "$12.4K",
      image: "/images/venu-logo.png",
    },
    {
      id: "promoter2",
      name: "Rock Nation",
      location: "Philadelphia, PA",
      type: "Rock & Metal",
      eventsCount: 12,
      revenue: "$18.7K",
      image: "/images/venu-logo.png",
    },
    {
      id: "promoter3",
      name: "Electronic Vibes",
      location: "Nashville, TN",
      type: "Electronic & EDM",
      eventsCount: 6,
      revenue: "$9.2K",
      image: "/images/venu-logo.png",
    },
  ], [])

  const myEvents = useMemo(() => [
    {
      id: 1,
      artist: "The Midnight Keys",
      date: "Sat, Oct 12",
      time: "8 PM doors",
      genre: "Jazz",
      ticketsSold: 50,
      totalTickets: 75,
      guarantee: 400,
      currentEarnings: 600,
      status: "live",
      applications: 3,
      image: "",
    },
    {
      id: 2,
      artist: "Electric Pulse",
      date: "Fri, Oct 18",
      time: "9 PM",
      genre: "Electronic",
      ticketsSold: 0,
      totalTickets: 100,
      guarantee: 300,
      currentEarnings: 0,
      status: "posted",
      applications: 7,
      image: "",
    },
    {
      id: 3,
      artist: "Acoustic Souls",
      date: "Thu, Oct 3",
      time: "7 PM",
      genre: "Folk",
      ticketsSold: 45,
      totalTickets: 60,
      guarantee: 250,
      currentEarnings: 350,
      status: "completed",
      applications: 0,
      image: "",
    },
  ], [])

  // Mock data for artist applications
  const artistApplications = useMemo(() => [
    {
      id: "app1",
      artist: "The Midnight Keys",
      genre: "Jazz",
      rating: 4.8,
      followers: "2.1K",
      bio: "Smooth jazz quartet with over 10 years of experience performing at prestigious locations across the country.",
      image: "/images/BandFallBack.PNG",
    },
    {
      id: "app2",
      artist: "Electric Pulse",
      genre: "Electronic",
      rating: 4.6,
      followers: "5.3K",
      bio: "High-energy electronic duo specializing in house and techno. Known for creating immersive dance experiences.",
      image: "/images/BandFallBack.PNG",
    },
    {
      id: "app3",
      artist: "Acoustic Souls",
      genre: "Folk",
      rating: 4.9,
      followers: "1.8K",
      bio: "Intimate folk trio blending traditional melodies with contemporary storytelling. Perfect for intimate locations.",
      image: "/images/BandFallBack.PNG",
    },
    {
      id: "app4",
      artist: "Rock Nation",
      genre: "Rock",
      rating: 4.4,
      followers: "8.7K",
      bio: "High-octane rock band with a loyal following. Known for electrifying performances and crowd engagement.",
      image: "/images/BandFallBack.PNG",
    },
  ], [])

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
      
      // Add new band and sort by time in one operation
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

  const canProceedToNext = useCallback(() => canProceedToNextStep, [canProceedToNextStep])

  const resetForm = useCallback(() => {
    setCurrentStep(1)
    setEventName("")
    setEventDate("")
    setEventTime("")
    setEventGenre("")
    setTicketCapacity("")
    setSelectedPromoter("")
    setPromoterEmail("")
    setPromoterPercentage("")
    setSelectedDoorPerson("")
    setDoorPersonEmail("")
    setRequirements([])
    setBands([])
    setGuarantee("")
    setBandEmail("")
  }, [])

  const handlePublish = useCallback(() => {
    // Here you would typically send the data to your backend
    console.log("Publishing gig:", {
      eventName,
      eventDate,
      eventTime,
      eventGenre,
      ticketCapacity,
      selectedPromoter,
      promoterEmail,
      promoterPercentage,
      selectedDoorPerson,
      doorPersonEmail,
      requirements,
      bands: bands.map(band => ({
        ...band,
        email: band.email
      })),
      guarantee
    })
    
    // Reset and close
    resetForm()
    setShowPostGig(false)
  }, [eventName, eventDate, eventTime, eventGenre, ticketCapacity, selectedPromoter, promoterEmail, promoterPercentage, selectedDoorPerson, doorPersonEmail, requirements, bands, guarantee, resetForm])

  const handleTabChange = useCallback((value: string) => setActiveTab(value), [])

  if (showPostGig) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <Button variant="outline" onClick={() => setShowPostGig(false)}>
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
                <Label htmlFor="promoter" className="text-foreground">
                  Promoter
                </Label>
                <Select value={selectedPromoter} onValueChange={setSelectedPromoter}>
                  <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select promoter" />
                  </SelectTrigger>
                  <SelectContent>
                    {myPromoters.map((promoter) => (
                      <SelectItem key={promoter.id} value={promoter.id}>
                        {promoter.name}
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
                      {TIME_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
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
                    {GENRE_OPTIONS.slice(0, 5).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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
            </div>
          </Card>
          )}

          {/* Step 2: Lineup */}
          {currentStep === 2 && (
            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">Bands/Artists</Label>
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
                          {GENRE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div>
                        <Label htmlFor="band-set-time" className="text-foreground">
                          Set Time
                        </Label>
                        <Select value={bandSetTime} onValueChange={setBandSetTime}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Select set time" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                      variant="outline" 
                      size="sm"
                      className="w-full"
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
                                          {getTimeLabel(band.setTime)}
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
                </div>

                <div className="space-y-3">
                  <Label className="text-foreground">Payout Summary</Label>
                  <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bands Total:</span>
                      <span className="text-foreground font-medium">
                        {bandsTotal}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-2">
                      <span className="text-foreground font-medium">Promoter:</span>
                      <span className="text-foreground font-medium">
                        {promoterPercentage || 0}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Promoter receives the specified percentage
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
                    <span className="text-muted-foreground">Promoter:</span>
                    <span className="text-foreground font-medium">
                      {myPromoters.find(p => p.id === selectedPromoter)?.name || 'Not selected'}
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
                    <span className="text-foreground font-medium">{promoterPercentage || 0}%</span>
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
                  variant="default"
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handlePublish}
                  disabled={!canProceedToNext()}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
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
          <div className="flex items-center gap-4">
            <Image src="/images/venu-logo.png" alt="venu" width={40} height={40} />
            <h1 className="font-serif font-bold text-xl">Location Dashboard</h1>
          </div>
          <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setShowPostGig(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Post a Gig
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          {/* Events Tab */}
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="events" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground">Events</TabsTrigger>
            <TabsTrigger value="applications" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground">Applications</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl">My Events</h2>
            </div>

            <div className="grid gap-4">
              {myEvents.map((event) => (
                <Card key={event.id} className="p-4 bg-card border-border">
                  <div className="flex items-start gap-4">
                    <Image
                      src={event.image || "/images/BandFallBack.PNG"}
                      alt={event.artist}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{event.artist}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {event.date} • {event.time}
                            <Badge variant="outline" className="text-xs">
                              {event.genre}
                            </Badge>
                          </div>
                        </div>
                        <Badge 
                          variant={event.status === 'live' ? 'default' : event.status === 'posted' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {event.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tickets:</span>
                          <div className="font-medium text-foreground">
                            {event.ticketsSold}/{event.totalTickets}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Guarantee:</span>
                          <div className="font-medium text-foreground">${event.guarantee}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Earnings:</span>
                          <div className="font-medium text-foreground">${event.currentEarnings}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Applications:</span>
                          <div className="font-medium text-foreground">{event.applications}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="default" size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                          View Details
                        </Button>
                        <Button variant="default" size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            <h2 className="font-serif font-bold text-xl">Artist Applications</h2>

            <div className="grid gap-4">
              {artistApplications.map((artist) => (
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
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {artist.genre}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {artist.followers}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>

                      <div className="flex gap-2 pt-2">
                        <Button variant="default" size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                          Decline
                        </Button>
                        <Button variant="default" size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="p-4 space-y-4">
            <h2 className="font-serif font-bold text-xl">Location Analytics</h2>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-card border-border text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">87%</div>
                <div className="text-sm text-muted-foreground">Avg Fill Rate</div>
              </Card>

              <Card className="p-4 bg-card border-border text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">$2.4K</div>
                <div className="text-sm text-muted-foreground">Monthly Revenue</div>
              </Card>
            </div>

            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-foreground mb-4">Popular Genres</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Jazz</span>
                  <div className="flex items-center gap-2">
                    <Progress value={85} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rock</span>
                  <div className="flex items-center gap-2">
                    <Progress value={65} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">65%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Electronic</span>
                  <div className="flex items-center gap-2">
                    <Progress value={45} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">45%</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-foreground mb-4">Recent Performance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last 30 days</span>
                  <span className="text-green-400">+12% ticket sales</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Artist satisfaction</span>
                  <span className="text-foreground">4.8/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Repeat bookings</span>
                  <span className="text-foreground">23%</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
