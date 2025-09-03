"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Trash2, Plus, Music, AlertTriangle } from "lucide-react"
import { GigProfile, gigApi } from "@/lib/api"

interface ManageEventModalProps {
  event: GigProfile | null
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

interface NewBand {
  name: string
  genre: string
  setTime: string
  percentage: string
  email: string
}

export function ManageEventModal({ event, isOpen, onClose, onRefresh }: ManageEventModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newBand, setNewBand] = useState<NewBand>({
    name: "",
    genre: "",
    setTime: "",
    percentage: "",
    email: ""
  })

  // Helper function to convert 24-hour time to 12-hour format
  const formatTime12Hour = (time24: string): string => {
    try {
      // Handle various time formats
      const time = time24.trim()
      
      // If it's already in 12-hour format, return as is
      if (time.includes('AM') || time.includes('PM')) {
        return time
      }
      
      // If it's in 24-hour format (HH:MM), convert it
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':')
        const hour = parseInt(hours, 10)
        const minute = parseInt(minutes, 10)
        
        if (isNaN(hour) || isNaN(minute)) {
          return time24 // Return original if parsing fails
        }
        
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        
        return `${displayHour}:${minutes.padStart(2, '0')} ${period}`
      }
      
      // If it's just hours (e.g., "20"), convert it
      const hour = parseInt(time, 10)
      if (!isNaN(hour) && hour >= 0 && hour <= 23) {
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        
        return `${displayHour}:00 ${period}`
      }
      
      return time24 // Return original if no conversion possible
    } catch {
      return time24 // Return original if any error occurs
    }
  }

  if (!event) return null

  const handleDeleteEvent = async () => {
    try {
      setIsLoading(true)
      const response = await gigApi.deleteGig(event._id)
      
      if (response.success) {
        onRefresh()
        onClose()
        setIsDeleteDialogOpen(false)
      } else {
        console.error('Failed to delete event:', response.error)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBand = async () => {
    if (!newBand.name || !newBand.genre || !newBand.setTime || !newBand.percentage || !newBand.email) {
      return
    }

    try {
      setIsLoading(true)
      
      const updatedBands = [
        ...event.bands,
        {
          name: newBand.name,
          genre: newBand.genre,
          setTime: newBand.setTime,
          percentage: parseFloat(newBand.percentage),
          email: newBand.email,
          confirmed: true // Mark as confirmed when added
        }
      ]

      const response = await gigApi.updateGig(event._id, {
        bands: updatedBands
        // Don't update numberOfBands - keep it at the original value
      })

      if (response.success) {
        // Reset form
        setNewBand({
          name: "",
          genre: "",
          setTime: "",
          percentage: "",
          email: ""
        })
        onRefresh()
      } else {
        console.error('Failed to add band:', response.error)
      }
    } catch (error) {
      console.error('Error adding band:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveBand = async (bandIndex: number) => {
    try {
      setIsLoading(true)
      
      const updatedBands = event.bands.filter((_, index) => index !== bandIndex)
      
      const response = await gigApi.updateGig(event._id, {
        bands: updatedBands
        // Don't update numberOfBands - keep it at the original value
      })

      if (response.success) {
        onRefresh()
      } else {
        console.error('Failed to remove band:', response.error)
      }
    } catch (error) {
      console.error('Error removing band:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalBandPercentage = event.bands.reduce((sum, band) => sum + band.percentage, 0)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Manage Event: {event.eventName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Bands */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Current Bands</h3>
                <Badge variant="outline" className="text-xs">
                  {event.bands.length}/{event.numberOfBands} Bands
                </Badge>
              </div>
              
              {event.bands.length > 0 ? (
                <div className="space-y-3">
                  {event.bands.map((band, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                          <div className="flex-1">
                      <div className="font-medium text-foreground">{band.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {band.genre} • {formatTime12Hour(band.setTime)} • {band.percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">{band.email}</div>
                    </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleRemoveBand(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Music className="w-8 h-8 mx-auto mb-2" />
                  <p>No bands added yet</p>
                </div>
              )}

              {/* Band Percentage Warning */}
              {totalBandPercentage > 100 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Total band percentage exceeds 100% ({totalBandPercentage}%)
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Add New Band */}
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-4">Add New Band</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bandName">Band Name</Label>
                  <Input
                    id="bandName"
                    value={newBand.name}
                    onChange={(e) => setNewBand(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter band name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bandGenre">Genre</Label>
                  <Select value={newBand.genre} onValueChange={(value) => setNewBand(prev => ({ ...prev, genre: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rock">Rock</SelectItem>
                      <SelectItem value="Jazz">Jazz</SelectItem>
                      <SelectItem value="Electronic">Electronic</SelectItem>
                      <SelectItem value="Folk">Folk</SelectItem>
                      <SelectItem value="Blues">Blues</SelectItem>
                      <SelectItem value="Pop">Pop</SelectItem>
                      <SelectItem value="Country">Country</SelectItem>
                      <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                      <SelectItem value="Classical">Classical</SelectItem>
                      <SelectItem value="Reggae">Reggae</SelectItem>
                      <SelectItem value="Punk">Punk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="bandSetTime">Set Time</Label>
                  <Input
                    id="bandSetTime"
                    value={newBand.setTime}
                    onChange={(e) => setNewBand(prev => ({ ...prev, setTime: e.target.value }))}
                    placeholder="e.g., 8:00 PM"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bandPercentage">Percentage (%)</Label>
                  <Input
                    id="bandPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={newBand.percentage}
                    onChange={(e) => setNewBand(prev => ({ ...prev, percentage: e.target.value }))}
                    placeholder="0-100"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="bandEmail">Email</Label>
                  <Input
                    id="bandEmail"
                    type="email"
                    value={newBand.email}
                    onChange={(e) => setNewBand(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="band@example.com"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleAddBand}
                disabled={isLoading || !newBand.name || !newBand.genre || !newBand.setTime || !newBand.percentage || !newBand.email}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Band
              </Button>
            </Card>

            {/* Danger Zone */}
            <Card className="p-4 border-red-200 bg-red-50">
              <h3 className="font-semibold text-lg mb-4 text-red-700">Danger Zone</h3>
              <p className="text-sm text-red-600 mb-4">
                Deleting this event will permanently remove it and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Event
              </Button>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event &quot;{event.eventName}&quot; and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
