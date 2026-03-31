"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Calendar, MapPin, CreditCard, CheckCircle, Share2, Download, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { getLocationDisplayName } from "@/lib/location-data"
import { timeUtils } from "@/lib/utils"
import { ticketApi, gigApi, PurchasedTicket } from "@/lib/api"

// Stripe is loaded lazily so the bundle doesn't grow until the payment step
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface TicketPurchaseProps {
  eventId: string
  onBack: () => void
  eventData?: {
    id: string
    artist: string
    location: string
    address: string
    date: string
    time: string
    genre: string
    ticketPrice: number
    ticketsRemaining: number
    totalTickets: number
    description: string
    image: string
  }
}

// ── Inner form rendered inside <Elements> ────────────────────────────────────
function CheckoutForm({
  gigId,
  onSuccess,
  onError,
}: {
  gigId: string
  onSuccess: (ticket: PurchasedTicket) => void
  onError: (msg: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    try {
      // 1. Confirm the card payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      })

      if (error) {
        onError(error.message ?? "Payment failed. Please try again.")
        return
      }

      if (paymentIntent?.status === "succeeded") {
        // 2. Issue the ticket on our backend
        const res = await ticketApi.purchaseTicket(gigId, 1)
        if (res.success && res.data) {
          onSuccess(res.data)
        } else {
          onError(res.error ?? "Payment succeeded but ticket issuance failed. Contact support.")
        }
      } else {
        onError("Payment was not completed. Please try again.")
      }
    } catch {
      onError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {isSubmitting ? (
        <Button disabled className="w-full h-12 bg-purple-600 text-white">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Processing...
        </Button>
      ) : (
        <Button type="submit" disabled={!stripe} className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white">
          Pay Now
        </Button>
      )}
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function TicketPurchase({ onBack, eventData }: TicketPurchaseProps) {
  const [purchaseStep, setPurchaseStep] = useState<"details" | "payment" | "ticket">("details")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchasedTicket, setPurchasedTicket] = useState<PurchasedTicket | null>(null)

  const event = eventData || {
    id: "1",
    artist: "The Midnight Keys",
    location: "sarbez",
    address: "115 Anastasia Blvd, St. Augustine, FL 32080",
    date: "Sat, Oct 12",
    time: "8 PM doors",
    genre: "Jazz",
    ticketPrice: 25,
    ticketsRemaining: 25,
    totalTickets: 75,
    description: "An intimate evening of modern jazz in the heart of downtown.",
    image: "/images/SARBEZ.jpg",
  }

  const locationInfo = {
    name: getLocationDisplayName(event.location),
    address: event.address,
    image: event.image,
  }

  // When moving to the payment step, create the PaymentIntent
  const handleProceedToPayment = async () => {
    setLoadingIntent(true)
    setPurchaseError(null)
    try {
      const res = await gigApi.createPaymentIntent(event.id, 1)
      if (res.success && res.data?.clientSecret) {
        setClientSecret(res.data.clientSecret)
        setPurchaseStep("payment")
      } else {
        setPurchaseError(res.error ?? "Could not start payment. Please try again.")
      }
    } catch {
      setPurchaseError("Unable to connect. Please try again.")
    } finally {
      setLoadingIntent(false)
    }
  }

  // ── Payment step ──────────────────────────────────────────────────────────
  if (purchaseStep === "payment") {
    const stripeNotConfigured = !stripePromise

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
          {/* Order summary */}
          <Card className="p-6 bg-card border-border">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="font-semibold text-foreground mb-2">{event.artist}</h2>
                <p className="text-sm text-muted-foreground">
                  {locationInfo.name} • {event.date}
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

          {/* Payment form */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Payment Details</span>
            </div>

            {stripeNotConfigured ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-700">
                    Stripe is not yet configured. Add your{" "}
                    <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to{" "}
                    <code className="font-mono">.env.local</code> to enable real payments.
                  </p>
                </div>
                <Button
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={async () => {
                    // Fallback: issue ticket without payment (dev/demo mode)
                    setPurchaseError(null)
                    try {
                      const res = await ticketApi.purchaseTicket(event.id, 1)
                      if (res.success && res.data) {
                        setPurchasedTicket(res.data)
                        setPurchaseStep("ticket")
                      } else {
                        setPurchaseError(res.error ?? "Purchase failed.")
                      }
                    } catch {
                      setPurchaseError("Unable to complete purchase.")
                    }
                  }}
                >
                  Complete Purchase (Demo)
                </Button>
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  gigId={event.id}
                  onSuccess={(ticket) => {
                    setPurchasedTicket(ticket)
                    setPurchaseStep("ticket")
                  }}
                  onError={setPurchaseError}
                />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            )}

            {purchaseError && (
              <p className="text-sm text-red-500 mt-3 text-center">{purchaseError}</p>
            )}

            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground">
                Payments processed securely by Stripe. You&apos;ll receive your QR ticket immediately after purchase.
              </p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // ── Ticket confirmation step ───────────────────────────────────────────────
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
                <p className="text-muted-foreground">{locationInfo.name}</p>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </span>
                  <span>{timeUtils.formatTime12Hour(event.time)}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg mx-auto w-fit">
                {purchasedTicket?.qrCode ? (
                  <Image
                    src={purchasedTicket.qrCode}
                    alt="QR Ticket Code"
                    width={180}
                    height={180}
                    className="mx-auto"
                    unoptimized
                  />
                ) : (
                  <Image
                    src="/images/venu-logo.png"
                    alt="QR Ticket Code"
                    width={120}
                    height={120}
                    className="mx-auto"
                  />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Check in opens 30 min before doors</p>
                <p className="text-xs text-muted-foreground">
                  Show this QR code at the door for entry. Screenshot or save to your photos for backup.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Save Ticket
            </Button>
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Share2 className="w-4 h-4 mr-2" />
              Share Event
            </Button>
          </div>

          <Card className="p-4 bg-accent/10 border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="font-medium text-foreground">Location Address</span>
            </div>
            <p className="text-sm text-muted-foreground">{locationInfo.address}</p>
            <Button variant="ghost" size="sm" className="mt-2 text-accent">
              Get Directions
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // ── Event details step (default) ──────────────────────────────────────────
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
            src={event.image || "/images/venu-logo.png"}
            alt={event.artist}
            width={400}
            height={200}
            className="object-cover rounded-lg"
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-primary-foreground">{event.genre}</Badge>
          </div>
        </div>

        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div>
              <h2 className="font-serif font-bold text-2xl text-foreground mb-2">{event.artist}</h2>
              <p className="text-lg text-muted-foreground mb-3">{locationInfo.name}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {event.date} - {timeUtils.formatTime12Hour(event.time)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {locationInfo.address}
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

            {purchaseError && (
              <p className="text-sm text-red-500 text-center">{purchaseError}</p>
            )}

            <Button
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleProceedToPayment}
              disabled={loadingIntent}
            >
              {loadingIntent ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Preparing payment...</>
              ) : (
                `Buy Ticket — $${event.ticketPrice + 2.5}`
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
