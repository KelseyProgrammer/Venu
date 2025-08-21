"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Calendar, MapPin, CreditCard, CheckCircle, Share2, Download } from "lucide-react"
import Image from "next/image"

interface TicketPurchaseProps {
  eventId: string
  onBack: () => void
}

export function TicketPurchase({ eventId, onBack }: TicketPurchaseProps) {
  const [purchaseStep, setPurchaseStep] = useState<"details" | "payment" | "ticket">("details")

  // Mock event data
  const event = {
    id: 1,
    artist: "The Midnight Keys",
    venue: "The Blue Note",
    location: "123 Jazz Street, Downtown",
    date: "Sat, Oct 12",
    time: "8 PM doors",
    genre: "Jazz",
    ticketPrice: 25,
    ticketsRemaining: 25,
    totalTickets: 75,
    description: "An intimate evening of modern jazz in the heart of downtown.",
    image: "/purple-concert-stage.png",
  }

  const mockQRCode =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZmZmZiIvPgogIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxODAiIGZpbGw9IiMwMDAwMDAiLz4KICA8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjZmZmZmZmIi8+CiAgPHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K"

  if (purchaseStep === "payment") {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={() => setPurchaseStep("details")} className="p-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif font-bold text-lg">Secure Payment</h1>
            <div />
          </div>
        </div>

        <div className="p-4 space-y-6 max-w-sm mx-auto">
          <Card className="p-6 bg-card border-border">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="font-semibold text-foreground mb-2">{event.artist}</h2>
                <p className="text-sm text-muted-foreground">
                  {event.venue} • {event.date}
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Ticket price</span>
                  <span className="text-sm font-medium text-foreground">${event.ticketPrice}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Service fee</span>
                  <span className="text-sm font-medium text-foreground">$2.50</span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="font-bold text-foreground">${event.ticketPrice + 2.5}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Payment Method</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-accent/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      VISA
                    </div>
                    <span className="text-sm text-foreground">•••• 4242</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Change
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  Your payment is processed securely through Stripe. You'll receive your QR ticket immediately after
                  purchase.
                </p>
              </div>
            </div>
          </Card>

          <Button
            onClick={() => setPurchaseStep("ticket")}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Complete Purchase
          </Button>
        </div>
      </div>
    )
  }

  if (purchaseStep === "ticket") {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif font-bold text-lg">Your Ticket</h1>
            <Button variant="ghost" size="sm">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6 max-w-sm mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="font-serif font-bold text-xl text-foreground mb-2">Ticket Confirmed!</h2>
            <p className="text-sm text-muted-foreground">Your QR ticket is ready for entry</p>
          </div>

          <Card className="p-6 bg-card border-border">
            <div className="text-center space-y-4">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{event.artist}</h3>
                <p className="text-muted-foreground">{event.venue}</p>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </span>
                  <span>{event.time}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg mx-auto w-fit">
                <Image
                  src={mockQRCode || "/placeholder.svg"}
                  alt="QR Ticket Code"
                  width={120}
                  height={120}
                  className="mx-auto"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Check in opens in 2h 15m</p>
                <p className="text-xs text-muted-foreground">
                  Show this QR code at the door for entry. Screenshot or save to your photos for backup.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Save Ticket
            </Button>
            <Button variant="outline" className="bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Share Event
            </Button>
          </div>

          <Card className="p-4 bg-accent/10 border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="font-medium text-foreground">Venue Location</span>
            </div>
            <p className="text-sm text-muted-foreground">{event.location}</p>
            <Button variant="ghost" size="sm" className="mt-2 text-accent">
              Get Directions
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif font-bold text-lg">Get Tickets</h1>
          <div />
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-sm mx-auto">
        <div className="relative">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.artist}
            width={400}
            height={200}
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-primary-foreground">{event.genre}</Badge>
          </div>
        </div>

        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div>
              <h2 className="font-serif font-bold text-2xl text-foreground mb-2">{event.artist}</h2>
              <p className="text-lg text-muted-foreground mb-3">{event.venue}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {event.date} - {event.time}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Ticket Information</h3>
              <span className="text-sm text-accent">{event.ticketsRemaining} left</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">General Admission</p>
                <p className="text-sm text-muted-foreground">Standing room</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">${event.ticketPrice}</p>
                <p className="text-xs text-muted-foreground">+ $2.50 fee</p>
              </div>
            </div>

            <Button
              onClick={() => setPurchaseStep("payment")}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Buy Ticket - ${event.ticketPrice + 2.5}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
