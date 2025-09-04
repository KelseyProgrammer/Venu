"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, MapPin, Calendar, Star, Share2, CheckCircle, AlertCircle, CreditCard } from "lucide-react"
import Image from "next/image"
import { LOCATION_DATA } from "@/lib/location-data"

interface GigDetailsProps {
  gigId: string
  onBack: () => void
  gigData?: {
    id: number
    location: string
    date: string
    time: string
    genre: string
    guarantee: number
    tiers: Array<{
      threshold: number
      amount: number
      label: string
      color: string
    }>
    ticketsSold: number
    totalTickets: number
    rating: number
    reviews: number
    checklist: Array<{
      id: number
      item: string
      completed: boolean
      type: string
    }>
  }
}

export function GigDetails({ onBack, gigData }: GigDetailsProps) {
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [checklistAgreed, setChecklistAgreed] = useState(false)
  const [bookingStep, setBookingStep] = useState<"checklist" | "payment" | "confirmation">("checklist")

  // Use passed gig data or fall back to default
  const gig = gigData || {
    id: 1,
    location: "sarbez", // Use location key instead of full name
    date: "Sat, Oct 12",
    time: "8 PM doors",
    genre: "Jazz",
    guarantee: 400,
    tiers: [
      { threshold: 50, amount: 400, label: "50 tickets = $400", color: "bg-yellow-500" },
      { threshold: 75, amount: 600, label: "75 tickets = $600", color: "bg-green-500" },
    ],
    ticketsSold: 50,
    totalTickets: 75,
    rating: 4.8,
    reviews: 127,
    checklist: [
      { id: 1, item: "Location provides PA system, backline", completed: true, type: "location" },
      { id: 2, item: "Artist must promote $% on socials (template posts provided)", completed: false, type: "artist" },
      { id: 3, item: "Arrive 1 hour early for soundcheck", completed: false, type: "artist" },
      { id: 4, item: "Professional stage lighting included", completed: true, type: "location" },
    ],
  }

      // Ensure location has a fallback value
    const locationKey = gig.location || "sarbez"
    
    // Get location details from standardized data
    const locationInfo = LOCATION_DATA[locationKey as keyof typeof LOCATION_DATA] || LOCATION_DATA.sarbez

  // Ensure critical properties have fallback values
  const ticketsSold = gig.ticketsSold || 0
  const totalTickets = gig.totalTickets || 1
  const guarantee = gig.guarantee || 0

  const progress = (ticketsSold / totalTickets) * 100
  
  // Ensure tiers array exists and has proper structure
  const tiers = gig.tiers || []
  const currentTier = tiers.find((tier: { threshold: number; amount: number; label: string; color: string }) => ticketsSold >= tier.threshold) || {
    amount: guarantee,
    label: `${ticketsSold} tickets = $${guarantee}`,
  }
  
  // Ensure checklist array exists
  const checklist = gig.checklist || []

  const BookingFlow = () => {
    if (bookingStep === "checklist") {
      return (
        <DialogContent className="bg-card border-border max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Requirements</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please review and confirm you agree to all requirements for this gig.
            </p>

            <div className="space-y-3">
              {checklist.map((item: { id: number; item: string; completed: boolean; type: string }) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                  <div className="mt-0.5">
                    {item.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{item.item}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {item.type === "location" ? "Location provides" : "Artist must"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 p-4 bg-accent/10 rounded-lg">
              <Checkbox
                id="agree-checklist"
                checked={checklistAgreed}
                onCheckedChange={(checked) => setChecklistAgreed(checked as boolean)}
              />
              <label htmlFor="agree-checklist" className="text-sm text-foreground">
                I agree to all requirements listed above
              </label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowBookingFlow(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => setBookingStep("payment")}
                disabled={!checklistAgreed}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      )
    }

    if (bookingStep === "payment") {
      return (
        <DialogContent className="bg-card border-border max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Secure Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Escrow Protection</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your payment is held securely until the event is completed. This protects both you and the location.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Guaranteed minimum</span>
                <span className="text-sm font-medium text-foreground">${guarantee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current tier bonus</span>
                <span className="text-sm font-medium text-green-400">+${currentTier.amount - guarantee}</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Total payout</span>
                  <span className="font-bold text-foreground">${currentTier.amount}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Payment will be processed via Stripe Connect and released automatically after the event.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setBookingStep("checklist")} className="flex-1">
                Back
              </Button>
              <Button variant="purple" onClick={() => setBookingStep("confirmation")} className="flex-1">
                Confirm Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      )
    }

    if (bookingStep === "confirmation") {
      return (
        <DialogContent className="bg-card border-border max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-center">Booking Confirmed!</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>

            <div>
                              <h3 className="font-semibold text-foreground mb-1">{locationInfo.name}</h3>
              <p className="text-sm text-muted-foreground">
                {gig.date} - {gig.time}
              </p>
            </div>

            <div className="p-4 bg-accent/10 rounded-lg">
              <p className="text-sm text-foreground mb-2">Your gig is confirmed!</p>
              <p className="text-xs text-muted-foreground">
                You&apos;ll receive promotional materials and event details via email. Payment will be processed after the
                event.
              </p>
            </div>

            <Button
              variant="purple"
              onClick={() => {
                setShowBookingFlow(false)
                setBookingStep("checklist")
                setChecklistAgreed(false)
                onBack()
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif font-bold text-lg">Gig Details</h1>
          <Button variant="ghost" size="sm">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-sm mx-auto">
        {/* Hero Image */}
        <div className="relative">
          <Image
                              src={locationInfo.image || "/images/venu-logo.png"}
                  alt={locationInfo.name}
            width={400}
            height={200}
            className="object-cover rounded-lg"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-primary-foreground">{gig.genre}</Badge>
          </div>
        </div>

        {/* Event Info */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div>
                              <h2 className="font-serif font-bold text-2xl text-foreground mb-2">{locationInfo.name}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {gig.date} - {gig.time}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {gig.rating} ({gig.reviews})
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {locationInfo.address}
              </div>
            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed">{locationInfo.description}</p>
          </div>
        </Card>

        {/* Payout Information */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Payout Tiers</h3>
              <span className="text-sm text-accent">2 opening acts needed</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current earnings</span>
                <span className="font-bold text-foreground">${currentTier.amount}</span>
              </div>

              <div className="space-y-2">
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {ticketsSold} tickets = ${currentTier.amount}
                  </span>
                  <span>{totalTickets} tickets = $600</span>
                </div>
              </div>

              <div className="space-y-2">
                {tiers.map((tier: { threshold: number; amount: number; label: string; color: string }, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                    <span className="text-muted-foreground">{tier.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Checklist */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Checklist</h3>

            <div className="space-y-3">
              {checklist.map((item: { id: number; item: string; completed: boolean; type: string }) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-muted-foreground rounded" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{item.item}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {item.type === "location" ? "Location provides" : "Artist must"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-6">
          <Button variant="outline" className="flex-1 bg-transparent">
            <Share2 className="w-4 h-4 mr-2" />
            Share Gig
          </Button>

          <Dialog open={showBookingFlow} onOpenChange={setShowBookingFlow}>
            <DialogTrigger asChild>
              <Button variant="purple" className="flex-1">Book Now</Button>
            </DialogTrigger>
            <BookingFlow />
          </Dialog>
        </div>
      </div>
    </div>
  )
}
