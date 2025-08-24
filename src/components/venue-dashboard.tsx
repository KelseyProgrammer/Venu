"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, Users, TrendingUp, DollarSign, Star, Eye, ArrowLeft, ArrowRight, Check } from "lucide-react"
import Image from "next/image"

// Step configuration
const GIG_STEPS = [
  { id: 1, title: "Event Details", description: "Basic event information" },
  { id: 2, title: "Lineup", description: "Bands and scheduling" },
  { id: 3, title: "Payout", description: "Financial structure" },
  { id: 4, title: "Staff & Requirements", description: "Team and artist needs" },
  { id: 5, title: "Review", description: "Final review and publish" }
]

export function VenueDashboard() {
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

  const myEvents = [
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
      image: "/images/venu-logo.png",
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
      image: "/images/venu-logo.png",
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
      image: "/images/venu-logo.png",
    },
  ]

  const handleRequirementsKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const text = requirementsInput.trim()
      if (text) {
        const newRequirement = {
          id: Date.now().toString(),
          text: text,
          checked: false
        }
        setRequirements([...requirements, newRequirement])
        setRequirementsInput("")
      }
    }
  }

  const toggleRequirement = (id: string) => {
    setRequirements(requirements.map(req => 
      req.id === id ? { ...req, checked: !req.checked } : req
    ))
  }

  const removeRequirement = (id: string) => {
    setRequirements(requirements.filter(req => req.id !== id))
  }

  const addBand = () => {
    if (bandName.trim() && bandGenre.trim() && bandSetTime.trim() && bandPercentage.trim() && bandEmail.trim()) {
      const newBand = {
        id: Date.now().toString(),
        name: bandName.trim(),
        genre: bandGenre.trim(),
        setTime: bandSetTime.trim(),
        percentage: bandPercentage.trim(),
        email: bandEmail.trim()
      }
      const updatedBands = [...bands, newBand]
      // Sort bands by time
      updatedBands.sort((a, b) => a.setTime.localeCompare(b.setTime))
      setBands(updatedBands)
      setBandName("")
      setBandGenre("")
      setBandSetTime("")
      setBandPercentage("")
      setBandEmail("")
    }
  }

  const removeBand = (id: string) => {
    setBands(bands.filter(band => band.id !== id))
  }

  const artistApplications = [
    {
      id: 1,
      artist: "Luna & The Waves",
      genre: "Indie Rock",
      followers: "2.3K",
      rating: 4.7,
      bio: "Dreamy indie rock with ethereal vocals and atmospheric soundscapes.",
      image: "/images/venu-logo.png",
    },
    {
      id: 2,
      artist: "Jazz Collective",
      genre: "Jazz",
      followers: "1.8K",
      rating: 4.9,
      bio: "Modern jazz ensemble bringing fresh energy to classic standards.",
      image: "/images/venu-logo.png",
    },
  ]

  const nextStep = () => {
    if (currentStep < GIG_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return eventName.trim() && eventDate && eventTime && eventGenre && ticketCapacity.trim()
      case 2:
        return bands.length > 0
      case 3:
        return guarantee.trim() && (parseFloat(promoterPercentage) || 0) + bands.reduce((sum, band) => sum + (parseFloat(band.percentage) || 0), 0) <= 100
      case 4:
        return true // Optional step
      default:
        return true
    }
  }

  const resetForm = () => {
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
  }

  const handlePublish = () => {
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
  }

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
              <div className="flex items-start justify-between mb-6">
                {GIG_STEPS.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mb-4 ${
                      currentStep > step.id 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : currentStep === step.id 
                        ? 'border-primary text-primary' 
                        : 'border-muted-foreground text-muted-foreground'
                    }`}>
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="font-medium">{step.id}</span>
                      )}
                    </div>
                    
                    {/* Title and Description */}
                    <div className="text-center px-2 min-h-[4rem] flex flex-col justify-center">
                      <h3 className={`text-sm font-medium leading-tight mb-1 ${
                        currentStep === step.id 
                          ? 'text-primary' 
                          : currentStep > step.id 
                          ? 'text-foreground' 
                          : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-xs leading-tight ${
                        currentStep === step.id 
                          ? 'text-primary/80' 
                          : currentStep > step.id 
                          ? 'text-muted-foreground' 
                          : 'text-muted-foreground/60'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Connecting Line */}
                    {index < GIG_STEPS.length - 1 && (
                      <div className={`w-full h-0.5 mt-4 ${
                        currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />
                    )}
                    {/* Line after the last step */}
                    {index === GIG_STEPS.length - 1 && (
                      <div className={`w-full h-0.5 mt-4 ${
                        currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Current Step Highlight */}
              <div className="text-center mb-4">
                <h2 className="font-semibold text-foreground text-lg">{GIG_STEPS[currentStep - 1].title}</h2>
                <p className="text-sm text-muted-foreground">{GIG_STEPS[currentStep - 1].description}</p>
              </div>
              
              <Progress value={(currentStep / GIG_STEPS.length) * 100} className="h-2" />
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
                      placeholder="Percentage (e.g., 30)"
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
                   <div className="mt-4">
                     <Label className="text-sm font-medium text-foreground mb-3 block">Show Lineup</Label>
                     <div className="space-y-3">
                       {bands.map((band, index) => (
                         <div key={band.id} className="bg-card border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors">
                           <div className="flex items-start justify-between">
                             <div className="flex-1 space-y-3">
                               {/* Band Name and Genre */}
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                   <span className="text-sm font-semibold text-primary">{index + 1}</span>
                                 </div>
                                 <div>
                                   <h4 className="font-semibold text-foreground text-base">{band.name}</h4>
                                   <Badge variant="secondary" className="text-xs">
                                     {band.genre}
                                   </Badge>
                                 </div>
                               </div>
                               
                               {/* Set Time and Percentage */}
                               <div className="flex items-center gap-4 text-sm">
                                 <div className="flex items-center gap-2 text-muted-foreground">
                                   <Calendar className="w-4 h-4" />
                                   <span>
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
                                 <div className="flex items-center gap-2">
                                   <span className="text-muted-foreground">Payout:</span>
                                   <span className="font-semibold text-primary">{band.percentage}%</span>
                                 </div>
                               </div>
                               
                               {/* Email */}
                               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                 <span className="w-4 h-4 bg-muted rounded-full flex items-center justify-center">
                                   <span className="text-xs">@</span>
                                 </span>
                                 <span className="font-mono">{band.email}</span>
                               </div>
                             </div>
                             
                             {/* Remove Button */}
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => removeBand(band.id)}
                               className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                             >
                               ×
                             </Button>
                           </div>
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
                  <Label htmlFor="promoter" className="text-foreground">
                    Promoter
                  </Label>
                  <Select value={selectedPromoter} onValueChange={setSelectedPromoter}>
                    <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                      <SelectValue placeholder="Select promoter" />
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
                  
                  {selectedPromoter === "add-by-email" && (
                    <div className="mt-3">
                      <Label htmlFor="promoter-email" className="text-sm text-muted-foreground">
                        Promoter Email
                </Label>
                <Input
                        id="promoter-email"
                        type="email"
                        placeholder="Enter promoter's email address"
                        value={promoterEmail}
                        onChange={(e) => setPromoterEmail(e.target.value)}
                  className="mt-2 bg-input border-border text-foreground"
                />
              </div>
                  )}
            </div>

                <div>
                  <Label htmlFor="promoter-percentage" className="text-foreground">
                    Promoter Percentage
                  </Label>
                  <Input
                    id="promoter-percentage"
                    type="number"
                    placeholder="e.g. 20"
                    value={promoterPercentage}
                    onChange={(e) => setPromoterPercentage(e.target.value)}
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

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
                    <span className="text-muted-foreground">Promoter:</span>
                    <span className="text-foreground font-medium">{promoterPercentage || 0}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bands Total:</span>
                    <span className="text-foreground font-medium">
                      {bands.reduce((sum, band) => sum + (parseFloat(band.percentage) || 0), 0)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-2">
                    <span className="text-foreground font-medium">Venue Remainder:</span>
                    <span className="text-foreground font-medium">
                      {Math.max(0, 100 - (parseFloat(promoterPercentage) || 0) - bands.reduce((sum, band) => sum + (parseFloat(band.percentage) || 0), 0))}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Venue receives any remaining percentage after promoter and bands
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Promoter:</span>
                    <span className="text-foreground font-medium">{promoterPercentage || 0}%</span>
                  </div>
                  {bands.map((band) => (
                    <div key={band.id} className="flex justify-between">
                      <span className="text-muted-foreground">{band.name}:</span>
                      <span className="text-foreground font-medium">{band.percentage}%</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-foreground font-medium">Venue:</span>
                    <span className="text-foreground font-medium">
                      {Math.max(0, 100 - (parseFloat(promoterPercentage) || 0) - bands.reduce((sum, band) => sum + (parseFloat(band.percentage) || 0), 0))}%
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
            <span className="font-serif font-bold text-xl">venu</span>
          </div>
          <Button onClick={() => setShowPostGig(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-1" />
            Post Gig
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-card border-b border-border rounded-none h-12">
          <TabsTrigger
            value="events"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            My Events
          </TabsTrigger>
          <TabsTrigger
            value="applications"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Applications
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* My Events Tab */}
        <TabsContent value="events" className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl">My Events</h2>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-1" />
              Calendar
            </Button>
          </div>

          <div className="space-y-4">
            {myEvents.map((event) => {
              const progress = (event.ticketsSold / event.totalTickets) * 100

              return (
                <Card key={event.id} className="p-4 bg-card border-border">
                  <div className="flex gap-4">
                    <Image
                      src={event.image || "/images/venu-logo.png"}
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
                            <Calendar className="w-4 h-4" />
                            {event.date} - {event.time}
                          </div>
                        </div>
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
                        {event.status === "posted" && (
                          <span className="text-sm text-accent">{event.applications} applications</span>
                        )}
                        {event.status === "live" && (
                          <span className="text-sm text-green-400">${event.currentEarnings} revenue</span>
                        )}
                        {event.status === "completed" && (
                          <span className="text-sm text-green-400">${event.currentEarnings} total</span>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Artist Applications Tab */}
        <TabsContent value="applications" className="p-4 space-y-4">
          <h2 className="font-serif font-bold text-xl">Artist Applications</h2>

          <div className="space-y-4">
            {artistApplications.map((artist) => (
              <Card key={artist.id} className="p-4 bg-card border-border">
                <div className="flex gap-4">
                  <Image
                    src={artist.image || "/images/venu-logo.png"}
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
                        <Users className="w-4 h-4" />
                        {artist.followers}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{artist.bio}</p>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Decline
                      </Button>
                      <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
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
          <h2 className="font-serif font-bold text-xl">Venue Analytics</h2>

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
  )
}
