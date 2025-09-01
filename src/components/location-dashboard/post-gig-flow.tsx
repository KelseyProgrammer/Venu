"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, DollarSign, ArrowLeft, ArrowRight, Check, Calendar, Clock } from "lucide-react"
import { TIME_OPTIONS, GENRE_OPTIONS, getTimeLabel, GIG_STEPS } from "@/lib/constants"
import { Band, Requirement } from "./types"
import { useSocket } from "@/lib/socket"

interface PostGigFlowProps {
  onClose: () => void;
}

export function PostGigFlow({ onClose }: PostGigFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const socket = useSocket()
  
  // Saved promoters state - commented out for now
  // const [savedPromoters, setSavedPromoters] = useState<Promoter[]>([])
  // const [newPromoterName, setNewPromoterName] = useState("")
  // const [newPromoterEmail, setNewPromoterEmail] = useState("")
  // const [newPromoterPayout, setNewPromoterPayout] = useState("")
  
  // Saved door persons state - commented out for now
  // const [savedDoorPersons, setSavedDoorPersons] = useState<DoorPerson[]>([])
  // const [newDoorPersonName, setNewDoorPersonName] = useState("")
  // const [newDoorPersonEmail, setNewDoorPersonEmail] = useState("")
  
  // Form state
  const [eventName, setEventName] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState<string | undefined>(undefined)
  const [eventGenre, setEventGenre] = useState<string | undefined>(undefined)
  const [ticketCapacity, setTicketCapacity] = useState("")
  const [ticketPrice, setTicketPrice] = useState("")
  
  const [selectedPromoter, setSelectedPromoter] = useState<string | undefined>(undefined)
  const [promoterEmail, setPromoterEmail] = useState("")
  const [promoterPercentage, setPromoterPercentage] = useState("")
  
  const [selectedDoorPerson, setSelectedDoorPerson] = useState<string | undefined>(undefined)
  const [doorPersonEmail, setDoorPersonEmail] = useState("")
  
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [requirementsInput, setRequirementsInput] = useState("")
  
  const [bands, setBands] = useState<Band[]>([])
  const [bandName, setBandName] = useState("")
  const [bandGenre, setBandGenre] = useState<string | undefined>(undefined)
  const [bandSetTime, setBandSetTime] = useState<string | undefined>(undefined)
  const [bandPercentage, setBandPercentage] = useState("")
  const [bandEmail, setBandEmail] = useState("")
  
  const [guarantee, setGuarantee] = useState("")
  const [numberOfBands, setNumberOfBands] = useState("")

  // Memoized calculations
  const bandsTotal = useMemo(() => 
    bands.reduce((sum, band) => sum + (parseFloat(band.percentage) || 0), 0), 
    [bands]
  )

  const canProceedToNextStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return eventName.trim() && eventDate && eventTime && eventGenre && ticketCapacity.trim() && ticketPrice.trim() && selectedPromoter && 
               (selectedPromoter === "self" || 
                (selectedPromoter === "add-by-email" && promoterEmail.trim()))
      case 2:
        return bands.length > 0
      case 3:
        return guarantee.trim() && (parseFloat(promoterPercentage) || 0) + bandsTotal <= 100
      case 4:
        return true // Optional step
      default:
        return true
    }
  }, [currentStep, eventName, eventDate, eventTime, eventGenre, ticketCapacity, ticketPrice, selectedPromoter, promoterEmail, bands, guarantee, promoterPercentage, bandsTotal])

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
    if (bandName.trim() && bandGenre?.trim() && bandSetTime?.trim() && bandPercentage.trim() && bandEmail.trim()) {
      const newBand = {
        id: Date.now().toString(),
        name: bandName.trim(),
        genre: bandGenre!.trim(),
        setTime: bandSetTime!.trim(),
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
      setBandGenre(undefined)
      setBandSetTime(undefined)
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
    setTicketPrice("")
    setNumberOfBands("")
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
    // Data would be sent to backend API here
    
    // Create gig data object
    const gigData = {
      eventName,
      eventDate,
      eventTime,
      eventGenre,
      ticketCapacity: parseInt(ticketCapacity) || 0,
      ticketPrice: parseFloat(ticketPrice) || 0,
      guarantee: parseFloat(guarantee) || 0,
      bands,
      promoterPercentage: parseFloat(promoterPercentage) || 0,
      doorPerson: selectedDoorPerson,
      requirements,
      createdBy: "current-user-id", // This would come from auth context
      createdAt: new Date().toISOString()
    }

    // Generate a unique gig ID (in real app, this would come from backend)
    const gigId = `gig-${Date.now()}`
    const locationId = "default-location" // This would come from props or context

    // Send real-time gig update via Socket.io
    if (socket.connected) {
      socket.sendGigUpdate(gigId, locationId, "created", gigData)
      
      // Send notifications to relevant users
      bands.forEach(band => {
        if (band.email) {
          socket.sendNotification(
            "band-user-id", // This would be the actual band's user ID
            "gig-invitation",
            "New Gig Invitation",
            `You've been invited to perform at ${eventName} on ${eventDate}`,
            { gigId, gigData }
          )
        }
      })

      // Notify promoter if selected
      if (selectedPromoter && promoterEmail) {
        socket.sendNotification(
          "promoter-user-id", // This would be the actual promoter's user ID
          "gig-invitation", 
          "New Gig Assignment",
          `You've been assigned to promote ${eventName} on ${eventDate}`,
          { gigId, gigData }
        )
      }

      // Notify door person if selected
      if (selectedDoorPerson && doorPersonEmail) {
        socket.sendNotification(
          "door-person-user-id", // This would be the actual door person's user ID
          "gig-invitation",
          "New Gig Assignment", 
          `You've been assigned as door person for ${eventName} on ${eventDate}`,
          { gigId, gigData }
        )
      }
    }
    
    // Reset and close
    resetForm()
    onClose()
  }, [resetForm, onClose, eventName, eventDate, eventTime, eventGenre, ticketCapacity, ticketPrice, guarantee, bands, promoterPercentage, selectedPromoter, selectedDoorPerson, requirements, socket])

  // Promoter management functions
  // const addPromoter = useCallback(() => {
  //   if (newPromoterName.trim() && newPromoterEmail.trim() && newPromoterPayout.trim()) {
  //     const newPromoter = {
  //       id: Date.now().toString(),
  //       name: newPromoterName.trim(),
  //       email: newPromoterEmail.trim(),
  //       payoutPercentage: newPromoterPayout.trim()
  //     }
  //     setSavedPromoters(prev => [...prev, newPromoter])
  //     setNewPromoterName("")
  //     setNewPromoterEmail("")
  //     setNewPromoterPayout("")
  //   }
  // }, [newPromoterName, newPromoterEmail, newPromoterPayout])

  // const removePromoter = useCallback((id: string) => {
  //   setSavedPromoters(prev => prev.filter(promoter => promoter.id !== id))
  // }, [])

  // Handle promoter selection and auto-update payout percentage
  const handlePromoterSelection = useCallback((promoterId: string) => {
    setSelectedPromoter(promoterId)
    if (promoterId !== "self" && promoterId !== "add-by-email") {
      // const selectedPromoterData = savedPromoters.find(p => p.id === promoterId)
      // if (selectedPromoterData) {
      //   setPromoterPercentage(selectedPromoterData.payoutPercentage)
      // }
      setPromoterPercentage("")
    } else {
      setPromoterPercentage("")
    }
  }, [])

  // Door person management functions
  // const addDoorPerson = useCallback(() => {
  //   if (newDoorPersonName.trim() && newDoorPersonEmail.trim()) {
  //     const newDoorPerson = {
  //       id: Date.now().toString(),
  //       name: newDoorPersonName.trim(),
  //       email: newDoorPersonEmail.trim()
  //     }
  //     setSavedDoorPersons(prev => [...prev, newDoorPerson])
  //     setNewDoorPersonName("")
  //     setNewDoorPersonEmail("")
  //   }
  // }, [newDoorPersonName, newDoorPersonEmail])

  // const removeDoorPerson = useCallback((id: string) => {
  //   setSavedDoorPersons(prev => prev.filter(doorPerson => doorPerson.id !== id))
  // }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="outline" onClick={onClose}>
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
              <Select value={selectedPromoter || ""} onValueChange={handlePromoterSelection}>
                <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                  <SelectValue placeholder="Select promoter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">SELF</SelectItem>
                  {/* {savedPromoters.filter(promoter => promoter.id && promoter.id.trim() !== "").map((promoter) => (
                    <SelectItem key={promoter.id} value={promoter.id}>
                      {promoter.name} ({promoter.email})
                    </SelectItem>
                  ))} */}
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
                <Select value={eventTime || ""} onValueChange={setEventTime}>
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
              <Select value={eventGenre || ""} onValueChange={setEventGenre}>
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

            <div>
              <Label htmlFor="ticketPrice" className="text-foreground">
                Ticket Price ($)
              </Label>
              <Input
                id="ticketPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 25.00"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                className="mt-2 bg-input border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Price per ticket for bonus tier calculations
              </p>
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
                    <Select value={bandGenre || ""} onValueChange={setBandGenre}>
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
                      <Select value={bandSetTime || ""} onValueChange={setBandSetTime}>
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
                  variant="default" 
                  size="sm"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={!bandName.trim() || !bandGenre?.trim() || !bandSetTime?.trim() || !bandPercentage.trim() || !bandEmail.trim()}
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
                <p className="text-xs text-muted-foreground mt-1">
                  if no guarantee write 0
                </p>
              </div>

              {selectedPromoter && selectedPromoter !== "self" && (
                <div>
                  <Label htmlFor="promoter-percentage" className="text-foreground">
                    Promoter Percentage
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="promoter-percentage"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="20"
                      value={promoterPercentage}
                      onChange={(e) => setPromoterPercentage(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentage of revenue for the promoter
                  </p>
                </div>
              )}

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
                  <Select value={selectedDoorPerson || ""} onValueChange={setSelectedDoorPerson}>
                    <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                      <SelectValue placeholder="Select door person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">SELF</SelectItem>
                      {/* {savedDoorPersons.filter(doorPerson => doorPerson.id && doorPerson.id.trim() !== "").map((doorPerson) => (
                        <SelectItem key={doorPerson.id} value={doorPerson.id}>
                          {doorPerson.name} ({doorPerson.email})
                        </SelectItem>
                      ))} */}
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
                    {selectedPromoter === "self" ? "SELF" : 
                     selectedPromoter === "add-by-email" ? promoterEmail : 
                     selectedPromoter ? 'Not selected' : 'Not selected'}
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
