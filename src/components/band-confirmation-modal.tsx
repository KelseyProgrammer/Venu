"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Calendar, MapPin, Users } from "lucide-react"
import { gigApi, GigProfile } from "@/lib/api"
import { authUtils } from "@/lib/utils"

interface BandConfirmationModalProps {
  gig: GigProfile | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function BandConfirmationModal({ gig, isOpen, onClose, onConfirm }: BandConfirmationModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState<boolean | null>(null)

  useEffect(() => {
    if (gig) {
      // Find the current user's band in the gig
      const currentUser = authUtils.getCurrentUser()
      const currentUserEmail = currentUser?.email?.toLowerCase()
      const userBand = gig.bands.find(band => 
        band.email.toLowerCase() === currentUserEmail
      )
      setConfirmed(userBand?.confirmed || false)
    }
  }, [gig])

  const handleConfirmation = useCallback(async (confirm: boolean) => {
    if (!gig) return

    setIsConfirming(true)
    try {
      const currentUser = authUtils.getCurrentUser()
      const currentUserEmail = currentUser?.email
      if (!currentUserEmail) {
        throw new Error('User email not found')
      }

      const response = await gigApi.confirmBand(gig._id!, {
        bandEmail: currentUserEmail,
        confirmed: confirm
      })

      if (response.success) {
        setConfirmed(confirm)
        onConfirm()
        
        // Show success message
        alert(confirm ? 'Gig confirmed successfully!' : 'Gig confirmation removed.')
        
        // Dispatch a custom event to trigger data refresh in parent components
        window.dispatchEvent(new CustomEvent('gig-confirmation-completed', { 
          detail: { gigId: gig._id } 
        }))
      } else {
        throw new Error(response.error || 'Failed to confirm gig')
      }
    } catch (error) {
      console.error('Error confirming gig:', error)
      alert(`Failed to confirm gig: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsConfirming(false)
    }
  }, [gig, onConfirm])

  // Memoize user band lookup to prevent unnecessary recalculations
  const userBand = useMemo(() => {
    if (!gig) return null
    const currentUser = authUtils.getCurrentUser()
    const currentUserEmail = currentUser?.email?.toLowerCase()
    return gig.bands.find(band => 
      band.email.toLowerCase() === currentUserEmail
    )
  }, [gig])

  if (!gig || !isOpen) return null

  if (!userBand) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Band Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              You are not listed as a band member for this gig.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Gig Confirmation Required
              </CardTitle>
              <CardDescription>
                Please confirm your participation in this gig
              </CardDescription>
            </div>
            <Badge 
              variant={confirmed ? "default" : "secondary"}
              className={confirmed ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {confirmed ? "Confirmed" : "Pending"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Gig Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{gig.eventName}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(gig.eventDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {gig.eventTime}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Venue: {gig.selectedLocation?.name || 'TBA'}</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Genre: {gig.eventGenre}</span>
            </div>
          </div>

          {/* Band Details */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Your Band Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Band Name:</span>
                <p className="font-medium">{userBand.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Set Time:</span>
                <p className="font-medium">{userBand.setTime}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Percentage:</span>
                <p className="font-medium">{userBand.percentage}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium">
                  {userBand.confirmed ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Confirmed
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Gig Requirements */}
          {gig.requirements && gig.requirements.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Gig Requirements</h4>
              <ul className="space-y-2">
                {gig.requirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    {req.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confirmation Actions */}
          <div className="flex gap-3">
            {confirmed ? (
              <Button
                onClick={() => handleConfirmation(false)}
                disabled={isConfirming}
                variant="outline"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {isConfirming ? 'Removing...' : 'Remove Confirmation'}
              </Button>
            ) : (
              <Button
                onClick={() => handleConfirmation(true)}
                disabled={isConfirming}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isConfirming ? 'Confirming...' : 'Confirm Participation'}
              </Button>
            )}
            
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>

          {/* Status Message */}
          {confirmed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                ✅ You have confirmed your participation in this gig. The gig will be posted once all bands confirm.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
